import JSZip from "jszip";
import { saveAs } from "file-saver";
import { InvoiceData } from "@/types";

export async function exportWord(data: InvoiceData) {
  const response = await fetch("/COMMERCIAL INVOICE DEFAULT.docx");
  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  let docXml = await zip.file("word/document.xml")!.async("string");

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXml, "text/xml");

  // Find all <w:t> elements by local name (namespace-agnostic)
  function getAllTextElements(): Element[] {
    const result: Element[] = [];
    const all = xmlDoc.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === "t") {
        result.push(all[i]);
      }
    }
    return result;
  }

  const tEls = getAllTextElements();

  function getText(el: Element): string {
    return el.textContent || "";
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
      if (all[i].localName === "t") {
        result.push(all[i] as Element);
      }
    }
    return result;
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

  function replaceLabelValue(labelText: string, value: string): void {
    const label = findExact(labelText);
    if (!label) return;
    const para = parentPara(label);
    if (!para) return;
    const runs = siblingRuns(para);
    const idx = runs.findIndex((r) => getText(r) === labelText);
    if (idx === -1) return;
    for (let j = idx + 1; j < runs.length; j++) {
      runs[j].textContent = "";
    }
    if (idx + 1 < runs.length) {
      runs[idx + 1].textContent = value;
    }
  }

  const sellerAddrLine = data.sellerAddress
    .replace(/\r?\n/g, ", ")
    .replace(/\r/g, "");
  const buyerAddrLine = data.buyerAddress
    .replace(/\r?\n/g, ", ")
    .replace(/\r/g, "");

  // Header address (appears twice)
  replaceExact(
    "MEYDAN GRANDSTAND, 6TH FLOOR, MEYDAN ROAD, NAD AL SHEBA, DUBAI, U.A.E",
    sellerAddrLine
  );

  // Seller
  replaceExact("SELLER: GRAND TRADING L.L.C FZ", `SELLER: ${data.seller}`);

  // Seller address (multi-run in paragraph)
  const sellerAddrStart = findExact("MEYDAN GRANDSTAND 6");
  if (sellerAddrStart) {
    const para = parentPara(sellerAddrStart);
    if (para) {
      const runs = siblingRuns(para);
      for (const r of runs) r.textContent = "";
      runs[0].textContent = sellerAddrLine;
    }
  }

  // Buyer
  replaceExact(
    "BUYER: GIREXIM INTERNATIONAL PVT LTD",
    `BUYER: ${data.buyer}`
  );

  // Buyer address (multi-run paragraph)
  const buyerAddrStart = findExact("502, BUSINESS SQUARE, TAPOVAN,");
  if (buyerAddrStart) {
    const para = parentPara(buyerAddrStart);
    if (para) {
      const runs = siblingRuns(para);
      for (const r of runs) r.textContent = "";
      runs[0].textContent = buyerAddrLine;
    }
  }

  // Invoice number (multi-run: "GTL/GEI/00" etc.)
  const invPart = findExact("GTL/GEI/00");
  if (invPart) {
    const para = parentPara(invPart);
    if (para) {
      const runs = siblingRuns(para);
      // Label starts with " INVOICE NO: " which has trailing space
      const labelIdx = runs.findIndex(
        (r) => getText(r).includes("INVOICE NO:")
      );
      if (labelIdx >= 0) {
        for (let j = labelIdx + 1; j < runs.length; j++) {
          runs[j].textContent = "";
        }
        if (labelIdx + 1 < runs.length) {
          runs[labelIdx + 1].textContent = data.invoiceNo;
        }
      }
    }
  }

  // DATE
  replaceExact("20/04/2026", data.date);

  // INCO TERMS
  replaceExact("CNF", data.incoTerms);

  // GST NO
  replaceExact("GST NO: 24AAMCG3269L1Z6", `GST NO: ${data.gstNo}`);

  // MO
  replaceExact(" 9978302386", data.mo ? ` ${data.mo}` : "");

  // EMAIL
  replaceExact(
    "EMAIL: gireximinternationalpvtltd@gmail.com",
    `EMAIL: ${data.email}`
  );

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

  // VESSEL NAME
  const vesselVal = findExact("MEGALOPOLIS 616E");
  if (vesselVal) {
    vesselVal.textContent = data.vesselName;
  }
  const vesselPrefix = findExact("MAERSK ");
  if (vesselPrefix) vesselPrefix.textContent = "";

  // DRAFT BL. NO
  const blVal = findExact(" 268783156");
  if (blVal) {
    blVal.textContent = ` ${data.draftBlNo}`;
  }

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

  // HSN Code
  const hsnEls: Element[] = [];
  for (let i = 0; i < tEls.length; i++) {
    if (getText(tEls[i]) === "76020010") hsnEls.push(tEls[i]);
  }
  for (const h of hsnEls) h.textContent = data.hsnCode;

  // Goods description
  const desc1 = findExact("ALUMINIUM SCRAP ");
  const desc2 = findExact("ALUMINIUM SCRAP");
  const descEl = desc1 || desc2;
  if (descEl) descEl.textContent = data.descriptionOfGoods;

  // Quantity (appears twice)
  for (let i = 0; i < tEls.length; i++) {
    if (getText(tEls[i]) === "27.185 MT") {
      tEls[i].textContent = `${data.quantity} MT`;
    }
  }

  // Rate
  replaceExact("   2265", `   ${data.rate}`);

  // Amount in goods table (multi-run "$ " + "61" + "," + "574" + "." + "00")
  // Find "$ " runs that are followed by numeric content
  for (let i = 0; i < tEls.length; i++) {
    if (getText(tEls[i]) === "$ ") {
      const el = tEls[i];
      const para = parentPara(el);
      if (!para) continue;
      const runs = siblingRuns(para);
      const dollarIdx = runs.indexOf(el);
      if (dollarIdx >= 0 && runs.length > dollarIdx + 1) {
        // Check if next sibling is numeric
        const nextText = getText(runs[dollarIdx + 1]);
        if (/^\d+$/.test(nextText)) {
          // This is the goods amount row
          for (let j = dollarIdx + 1; j < runs.length; j++) {
            runs[j].textContent = "";
          }
          runs[dollarIdx + 1].textContent = data.amount;
        }
      }
    }
  }

  // Value in words
  replaceLabelValue("VALUE IN WORDS: ", data.valueInWords);

  // Bank details (all label:value are in separate runs)
  const bankNameVal = findExact("GRAND TRADING L.L.C-FZ");
  if (bankNameVal) bankNameVal.textContent = data.bankName;

  const bankBranchVal = findExact("EMIRATES ISLAMIC BANK P.J.S.C.");
  if (bankBranchVal) bankBranchVal.textContent = data.bankBranch;

  // BRANCH: "DEIRA" + ", DUBAI"
  const branchPart1 = findExact("DEIRA");
  const branchPart2 = findExact(", DUBAI");
  if (branchPart1 && branchPart2) {
    branchPart1.textContent = data.bankBranch;
    branchPart2.textContent = "";
  } else if (branchPart1) {
    branchPart1.textContent = data.bankBranch;
  }

  // IBAN NO
  const ibanVal = findExact("AE600340003708498512402(USD)");
  if (ibanVal) ibanVal.textContent = data.ibanNo;

  // ACCOUNT NO
  const acctVal = findExact("3708498512402(USD)");
  if (acctVal) acctVal.textContent = data.accountNo;

  // SWIFT CODE
  const swiftVal = findExact("MEBLAEADXXX");
  if (swiftVal) swiftVal.textContent = data.swiftCode;

  // Declaration label
  replaceExact("DECLARATION: ", "DECLARATION: ");

  // Declaration text
  for (let i = 0; i < tEls.length; i++) {
    const txt = getText(tEls[i]);
    if (
      txt.includes("WE DECLARE THAT THIS INVOICE") ||
      txt.includes("ACTUAL PRICE OF GOODS")
    ) {
      tEls[i].textContent = data.declaration;
      break;
    }
  }

  // Footer email
  replaceExact("grandbusiness2024@gmail.com", data.companyEmail);

  // Footer phone (multi-run: "+971 " + "50 " + "280 " + "0736")
  const phoneEls: Element[] = [];
  for (let i = 0; i < tEls.length; i++) {
    const txt = getText(tEls[i]);
    if (txt === "+971 " || txt === "50 " || txt === "280 " || txt === "0736") {
      phoneEls.push(tEls[i]);
    }
  }
  // Check if all 4 are in the same paragraph
  if (phoneEls.length >= 4) {
    const paras = phoneEls.map((el) => parentPara(el));
    const firstPara = paras[0];
    if (firstPara && paras.every((p) => p === firstPara)) {
      for (const el of phoneEls) el.textContent = "";
      phoneEls[0].textContent = data.companyPhone;
    } else {
      // Fallback: replace individually
      phoneEls[0].textContent = data.companyPhone;
      for (let j = 1; j < phoneEls.length; j++) phoneEls[j].textContent = "";
    }
  }

  // Serialize back
  const serializer = new XMLSerializer();
  docXml = serializer.serializeToString(xmlDoc);

  zip.file("word/document.xml", docXml);
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `GTL_COMMERCIAL_INVOICE_${data.invoiceNo.replace(/\//g, "_")}.docx`);
}
