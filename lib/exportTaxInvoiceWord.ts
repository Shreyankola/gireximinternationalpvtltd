import JSZip from "jszip";
import { saveAs } from "file-saver";
import { TaxInvoiceData } from "@/types";

export async function exportTaxInvoiceWord(data: TaxInvoiceData) {
  const response = await fetch("/TAX INVOICE REACTAPP.docx");
  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  let docXml = await zip.file("word/document.xml")!.async("string");

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXml, "text/xml");

  function getAllTextElements(): Element[] {
    const result: Element[] = [];
    const all = xmlDoc.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === "t") result.push(all[i] as Element);
    }
    return result;
  }

  const tEls = getAllTextElements();

  function findExact(text: string): Element | null {
    for (let i = 0; i < tEls.length; i++) {
      if ((tEls[i].textContent || "").trim() === text.trim()) return tEls[i];
    }
    return null;
  }

  function replaceExact(oldText: string, newText: string): void {
    const el = findExact(oldText);
    if (el) el.textContent = newText;
  }

  function parentPara(el: Element): Element | null {
    let p = el.parentElement;
    while (p) {
      if (p.localName === "p") return p;
      p = p.parentElement;
    }
    return null;
  }

  function clearAndSetPara(containerText: string, newText: string): void {
    const el = findExact(containerText);
    if (!el) return;
    const para = parentPara(el);
    if (!para) return;
    const runs: Element[] = [];
    const children = para.getElementsByTagName("*");
    for (let i = 0; i < children.length; i++) {
      if (children[i].localName === "t") runs.push(children[i] as Element);
    }
    if (runs.length > 0) {
      for (let i = 0; i < runs.length; i++) runs[i].textContent = "";
      runs[0].textContent = newText;
    }
  }

  // --- SELLER (R0C0) ---
  replaceExact("GIREXIM INTERNATIONAL PVT LTD", data.seller);
  replaceExact("502, BUSINESS SQUARE, TAPOVAN, NEAR ZANZARDA BYPASS CHOWKDI, ZANZARDA ROAD, JUNAGADH - 362001", data.sellerAddress);
  replaceExact("24AAMCG3269L1Z6", data.gstNo);
  replaceExact("AAMCG3269L", data.pan);

  // --- INVOICE META (R0C1) ---
  replaceExact("GIREXP-T-04/26-27", data.invoiceNo);
  replaceExact("20/06/2026", data.date);

  // --- BILL TO (R1C0) ---
  clearAndSetPara("DEVMETA INDUSTRIES LLP  ", `BILL TO: ${data.billTo}`);
  clearAndSetPara("B-93 GIDC, ELECTRONIC ESTATE", data.billToAddress);
  const billToGstEl = findExact("24AASFD6766A1ZC");
  if (billToGstEl) billToGstEl.textContent = data.billToGst;
  const billToPanEl = findExact("AASFD6766A");
  if (billToPanEl) billToPanEl.textContent = data.billToPan;

  // --- SHIP TO (R1C0 continued) ---
  clearAndSetPara("GROUND FLOOR SUR NO.317,318 NEAR RANASAN GIDC CIRCLE SHREE PANCHSHIL EDUCATION TRUST PUNDHRA GANDHINAGAR GUJARAT", data.shipToAddress);

  // --- MATERIAL (R1C1) ---
  replaceExact("ALUMINIUM SCRAP", data.material);
  replaceExact("CAAU6529285", data.containerNo);
  clearAndSetPara("1X40", data.noOfCon);
  replaceExact("27.499 MT", data.totalWeight);
  replaceExact("APPPA, NIGERIA", data.pol);
  replaceExact("MUNDRA, GUJARAT", data.pod);

  // --- TABLE 1 (Goods Table) ---
  replaceExact("76020010", data.hsnCode);
  replaceExact("Aluminium Scrap", data.descriptionOfGoods);
  replaceExact("27,499", data.qtyKg);

  // For rate and amount cells, find by index since ₹ symbol is tricky
  // R1C4: Rate, R1C5: Amount
  // Let's find table cells by position
  const tables = xmlDoc.getElementsByTagName("w\\:tbl");
  // Alternative: find by looking at the table structure
  
  // Find cell "297" in R1C4
  // The cells contain ₹ symbol + space + value, let me find text containing "297"
  const tablesAll = xmlDoc.getElementsByTagName("*");
  let table1Cells: Element[][] = [];
  let currentRow: Element[] = [];
  let inTable1 = false;
  let tableCount = 0;
  
  for (let i = 0; i < tablesAll.length; i++) {
    const el = tablesAll[i] as Element;
    if (el.localName === "tbl") {
      tableCount++;
      if (tableCount === 2) inTable1 = true;
      continue;
    }
    if (el.localName === "tr" && inTable1) {
      if (currentRow.length > 0) table1Cells.push(currentRow);
      currentRow = [];
      continue;
    }
    if (el.localName === "tc" && inTable1) {
      currentRow.push(el);
      continue;
    }
  }
  if (currentRow.length > 0) table1Cells.push(currentRow);

  // Table 1: row 0 = header, row 1 = item 1, row 2 = subtotal, row 3 = CGST, etc.
  function getCellText(cell: Element): string {
    const textEls = cell.getElementsByTagName("*");
    let text = "";
    for (let i = 0; i < textEls.length; i++) {
      if (textEls[i].localName === "t" && textEls[i].textContent) {
        text += textEls[i].textContent;
      }
    }
    return text.trim();
  }

  function setCellText(cell: Element, newText: string): void {
    const runEls = cell.getElementsByTagName("*");
    let firstRun = true;
    for (let i = 0; i < runEls.length; i++) {
      if (runEls[i].localName === "t") {
        if (firstRun) {
          runEls[i].textContent = newText;
          firstRun = false;
        } else {
          runEls[i].textContent = "";
        }
      }
    }
  }

  if (table1Cells.length >= 7) {
    // R1: Item row
    if (table1Cells[1].length >= 6) {
      setCellText(table1Cells[1][0], data.srNo);
      setCellText(table1Cells[1][1], data.hsnCode);
      setCellText(table1Cells[1][2], data.descriptionOfGoods);
      setCellText(table1Cells[1][3], data.qtyKg);
      setCellText(table1Cells[1][4], data.rateKg);
      setCellText(table1Cells[1][5], data.amount);
    }

    // R2: Subtotal
    if (table1Cells[2].length >= 6) {
      setCellText(table1Cells[2][3], data.qtyKg);
      setCellText(table1Cells[2][5], data.amount);
    }

    // R3: CGST
    if (table1Cells[3].length >= 6) {
      setCellText(table1Cells[3][5], data.cgst);
    }

    // R4: SGST
    if (table1Cells[4].length >= 6) {
      setCellText(table1Cells[4][5], data.sgst);
    }

    // R5: Round off
    if (table1Cells[5].length >= 6) {
      setCellText(table1Cells[5][5], data.roundOff);
    }

    // R6: Grand total
    if (table1Cells[6].length >= 6) {
      setCellText(table1Cells[6][5], data.grandTotal);
    }

    // R7: Amount in words (merged cell, all same)
    if (table1Cells[7].length >= 1) {
      setCellText(table1Cells[7][0], data.amountInWords);
    }

    // R8: Bank Details header / Authorized Signatory
    // Keep as is

    // R9: Bank details
    if (table1Cells[9].length >= 1) {
      const bankText = `Name: ${data.bankName}\nBANK NAME: ${data.bankBranchName}\nACCOUNT NO: ${data.accountNo}\nIFSC CODE: ${data.ifscCode}\nSWIFT CODE: ${data.swiftCodeTax}\nMICR CODE: ${data.micrCode}\nBRANCH: ${data.branch}`;
      const firstRun = table1Cells[9][0].getElementsByTagName("*");
      let foundFirst = false;
      for (let i = 0; i < firstRun.length; i++) {
        if (firstRun[i].localName === "t") {
          if (!foundFirst) {
            firstRun[i].textContent = bankText;
            foundFirst = true;
          } else {
            firstRun[i].textContent = "";
          }
        }
      }
    }
  }

  // --- TERMS ---
  const all = xmlDoc.getElementsByTagName("*");
  for (let i = 0; i < all.length; i++) {
    if (all[i].localName === "p") {
      const para = all[i] as Element;
      const texts: string[] = [];
      const children = para.getElementsByTagName("*");
      for (let j = 0; j < children.length; j++) {
        if (children[j].localName === "t" && children[j].textContent) {
          texts.push(children[j].textContent!.trim());
        }
      }
      const fullText = texts.join("").trim();
      for (let t = 0; t < data.terms.length; t++) {
        const prefix = `${t + 1})`;
        if (fullText.startsWith(prefix)) {
          const runs: Element[] = [];
          for (let j = 0; j < children.length; j++) {
            if (children[j].localName === "t") runs.push(children[j] as Element);
          }
          if (runs.length > 0) {
            runs[0].textContent = data.terms[t];
            for (let j = 1; j < runs.length; j++) runs[j].textContent = "";
          }
          break;
        }
      }
    }
  }

  const serializer = new XMLSerializer();
  docXml = serializer.serializeToString(xmlDoc);
  zip.file("word/document.xml", docXml);
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `TAX_INVOICE_${data.invoiceNo.replace(/\//g, "_")}.docx`);
}
