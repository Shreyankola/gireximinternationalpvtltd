import JSZip from "jszip";
import { saveAs } from "file-saver";
import { PerformaInvoiceData } from "@/types";

export async function exportPerformaInvoiceWord(data: PerformaInvoiceData) {
  const response = await fetch("/PERFORMA INVOICE DEFAULT.docx");
  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  let docXml = await zip.file("word/document.xml")!.async("string");

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXml, "text/xml");

  function getAllTextElements(): Element[] {
    const result: Element[] = [];
    const all = xmlDoc.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === "t") result.push(all[i]);
    }
    return result;
  }

  const tEls = getAllTextElements();

  function getText(el: Element): string {
    return el.textContent || "";
  }

  function findExact(text: string): Element | null {
    for (let i = 0; i < tEls.length; i++) {
      if (getText(tEls[i]) === text) return tEls[i];
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

  function siblingRuns(para: Element): Element[] {
    const result: Element[] = [];
    const all = para.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === "t") result.push(all[i] as Element);
    }
    return result;
  }

  function replaceLabelValue(labelText: string, value: string): void {
    const label = findExact(labelText);
    if (!label) return;
    const para = parentPara(label);
    if (!para) return;
    const runs = siblingRuns(para);
    const idx = runs.findIndex((r) => getText(r) === labelText);
    if (idx === -1) return;
    for (let j = idx + 1; j < runs.length; j++) runs[j].textContent = "";
    if (idx + 1 < runs.length) runs[idx + 1].textContent = value;
  }

  // Replace header seller address (appears twice)
  replaceExact("MEYDAN   GRANDSTAND,   6TH   FLOOR,   MEYDAN   ROAD, NAD AL SHEBA, DUBAI, U.A.E", data.sellerAddress);

  // Seller
  replaceExact("SELLER: GRAND TRADING L.L.C FZ", `SELLER: ${data.seller}`);

  // Seller address in second occurrence
  const sellerAddrStart = findExact("MEYDAN GRANDSTAND 6");
  if (sellerAddrStart) {
    const para = parentPara(sellerAddrStart);
    if (para) {
      const runs = siblingRuns(para);
      for (const r of runs) r.textContent = "";
      runs[0].textContent = data.sellerAddress;
    }
  }

  // Invoice number (split across runs: "GTL/GEI/00", "6 ", "/2 ", "6 ", "-2 ", "7")
  const invPart = findExact("GTL/GEI/00");
  if (invPart) {
    const para = parentPara(invPart);
    if (para) {
      const runs = siblingRuns(para);
      const labelIdx = runs.findIndex((r) => getText(r).includes("PROFORMA INVOICE NO:"));
      if (labelIdx >= 0) {
        for (let j = labelIdx + 1; j < runs.length; j++) runs[j].textContent = "";
        if (labelIdx + 1 < runs.length) runs[labelIdx + 1].textContent = data.invoiceNo;
      }
    }
  }

  // DATE
  replaceExact("01/06/2026", data.date);

  // INCO TERMS
  replaceExact("CNF", data.incoTerms);

  // BUYER
  replaceExact("BUYER: GIREXIM INTERNATIONAL PVT LTD", `BUYER: ${data.buyer}`);

  // Buyer address
  const buyerAddrStart = findExact("502, BUSINESS SQUARE, TAPOVAN,");
  if (buyerAddrStart) {
    const para = parentPara(buyerAddrStart);
    if (para) {
      const runs = siblingRuns(para);
      for (const r of runs) r.textContent = "";
      runs[0].textContent = data.buyerAddress;
    }
  }

  // GST NO
  replaceExact("GST NO: 24AAMCG3269L1Z6", `GST NO: ${data.gstNo}`);

  // MO
  replaceExact(" 9978302386", data.mo ? ` ${data.mo}` : "");

  // EMAIL
  replaceExact("EMAIL: gireximinternationalpvtltd@gmail.com", `EMAIL: ${data.email}`);

  // COUNTRY OF ORIGIN
  replaceLabelValue("COUNTRY OF ORIGIN: ", data.countryOfOrigin);

  // PORT OF LOADING
  replaceLabelValue("PORT OF LOADING: ", data.portOfLoading);

  // PORT OF DISCHARGE
  replaceLabelValue("PORT OF DISCHARGE: ", data.portOfDischarge);

  // NOTIFY PARTY
  replaceLabelValue("NOTIFY PARTY: ", data.notifyParty || "");

  // PAYMENT TERMS
  const payLabel = findExact("PAYMENY TERMS: ");
  if (payLabel) {
    const para = parentPara(payLabel);
    if (para) {
      const runs = siblingRuns(para);
      const idx = runs.findIndex((r) => getText(r) === "PAYMENY TERMS: ");
      if (idx >= 0) {
        for (let j = idx + 1; j < runs.length; j++) runs[j].textContent = "";
        if (idx + 1 < runs.length) runs[idx + 1].textContent = data.paymentTerms;
      }
    }
  }

  // SHIPPING TERMS
  replaceLabelValue("SHIPING TERMS: ", data.shippingTerms || "");

  // BL. NO
  replaceLabelValue("BL. NO:", data.blNo ? ` ${data.blNo}` : "");

  // S. BILL NO.
  const sbillEl = findExact("S. BILL NO.:");
  if (sbillEl) {
    const para = parentPara(sbillEl);
    if (para) {
      const runs = siblingRuns(para);
      const idx = runs.findIndex((r) => getText(r) === "S. BILL NO.:");
      if (idx >= 0) {
        for (let j = idx + 1; j < runs.length; j++) runs[j].textContent = "";
        if (idx + 1 < runs.length) runs[idx + 1].textContent = ` ${data.sBillNo || ""}`;
      }
    }
  }

  // MARK & NO
  replaceLabelValue("MARK & NO.", data.markAndNo || "");

  // HSN Code
  const hsnEls: Element[] = [];
  for (let i = 0; i < tEls.length; i++) {
    if (getText(tEls[i]) === "76020010") hsnEls.push(tEls[i]);
  }
  for (const h of hsnEls) h.textContent = data.hsnCode;

  // Description of goods
  const descEl = findExact("Aluminum  Scrap  Tense as per ISRI");
  if (descEl) descEl.textContent = data.descriptionOfGoods;

  // Quantity (appears twice in template: goods row + total row)
  for (let i = 0; i < tEls.length; i++) {
    if (getText(tEls[i]) === "27.5  MT") {
      tEls[i].textContent = `${data.quantity}  MT`;
    }
  }

  // Rate
  replaceExact("2336.93", data.rate);

  // Amount in goods table
  for (let i = 0; i < tEls.length; i++) {
    if (getText(tEls[i]) === "$ ") {
      const el = tEls[i];
      const para = parentPara(el);
      if (!para) continue;
      const runs = siblingRuns(para);
      const dollarIdx = runs.indexOf(el);
      if (dollarIdx >= 0 && runs.length > dollarIdx + 1) {
        const nextText = getText(runs[dollarIdx + 1]);
        if (/^[\d.]+$/.test(nextText.replace(/,/g, ""))) {
          for (let j = dollarIdx + 1; j < runs.length; j++) runs[j].textContent = "";
          runs[dollarIdx + 1].textContent = data.amount;
        }
      }
    }
  }

  // Value in words
  replaceLabelValue("VALUE IN WORDS: ", data.valueInWords);

  // Bank details
  const bankNameVal = findExact("GRAND TRADING L.L.C-FZ");
  if (bankNameVal) bankNameVal.textContent = data.bankName;

  const bankBranchVal = findExact("EMIRATES ISLAMIC BANK P.J.S.C.");
  if (bankBranchVal) bankBranchVal.textContent = data.bankBranch;

  const branchPart1 = findExact("DEIRA");
  const branchPart2 = findExact(", DUBAI");
  if (branchPart1 && branchPart2) {
    branchPart1.textContent = data.bankBranch;
    branchPart2.textContent = "";
  } else if (branchPart1) {
    branchPart1.textContent = data.bankBranch;
  }

  const ibanVal = findExact("AE600340003708498512402(USD)");
  if (ibanVal) ibanVal.textContent = data.ibanNo;

  const acctVal = findExact("3708498512402(USD)");
  if (acctVal) acctVal.textContent = data.accountNo;

  const swiftVal = findExact("MEBLAEADXXX");
  if (swiftVal) swiftVal.textContent = data.swiftCode;

  // Declaration
  replaceExact("DECLARATION: ", "DECLARATION: ");
  for (let i = 0; i < tEls.length; i++) {
    const txt = getText(tEls[i]);
    if (txt.includes("WE DECLARE THAT THIS INVOICE") || txt.includes("ACTUAL PRICE OF GOODS")) {
      tEls[i].textContent = data.declaration;
      break;
    }
  }

  // Footer email
  replaceExact("grandbusiness2024@gmail.com", data.companyEmail);

  // Footer phone
  const plusEl = findExact("+971");
  if (plusEl) {
    const para = parentPara(plusEl);
    if (para) {
      const runs = siblingRuns(para);
      for (const r of runs) r.textContent = "";
      runs[0].textContent = data.companyPhone;
    }
  }

  // Serialize back
  const serializer = new XMLSerializer();
  docXml = serializer.serializeToString(xmlDoc);

  zip.file("word/document.xml", docXml);
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `PERFORMA_INVOICE_${data.invoiceNo.replace(/\//g, "_")}.docx`);
}
