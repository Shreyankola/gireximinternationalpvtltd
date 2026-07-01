import JSZip from "jszip";
import { saveAs } from "file-saver";
import { PaymentAdviceData } from "@/types";

export async function exportPaymentAdviceWord(data: PaymentAdviceData) {
  const response = await fetch("/PAYMENT ADVICE DEFAULT.docx");
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

  // === DATE ===
  replaceExact("02/06/2026", data.date);

  // === GOODS DESCRIPTION ===
  const goodsEl = findExact("Aluminum  scrap  Tense as per ISRI");
  if (goodsEl) goodsEl.textContent = data.goodsDescription;

  // === CUSTOMER NAME & ADDRESS ===
  replaceExact("GIREXIM INTERNATIONAL PVT LTD", data.customerName);
  const addrPart1 = findExact("502, BUSINESS SQUARE, NEAR ZANZARDA BYPASS CHOWKDI, ZANZARDA");
  if (addrPart1) {
    const para = parentPara(addrPart1);
    if (para) {
      const runs = siblingRuns(para);
      for (const r of runs) r.textContent = "";
      runs[0].textContent = data.customerAddress;
    }
  }

  // === IEC ===
  replaceExact("2416903306", data.iec);

  // === INR A/C ===
  replaceExact("99909879577688", data.inrAcNo);

  // === FCY A/C ===
  const fcyLabel = findExact("FCY A/C  No:");
  if (fcyLabel) {
    const para = parentPara(fcyLabel);
    if (para) {
      const runs = siblingRuns(para);
      const idx = runs.indexOf(fcyLabel);
      if (idx >= 0) {
        for (let j = idx + 1; j < runs.length; j++) runs[j].textContent = "";
        if (idx + 1 < runs.length) runs[idx + 1].textContent = data.fcyAcNo || "";
      }
    }
  }

  // === AMOUNT ===
  const amountEl = findExact("64,265");
  if (amountEl) {
    const para = parentPara(amountEl);
    if (para) {
      const runs = siblingRuns(para);
      for (const r of runs) r.textContent = "";
      runs[0].textContent = `USD  ${data.amount}`;
    }
  }

  // === AMOUNT WORDS ===
  const wordsEl = findExact("USD SIXTY-FOUR THOUSAND TWO HUNDRED SIXTY-FIVE AND FIFTY-SEVEN CENTS ONLY");
  if (wordsEl) wordsEl.textContent = `( ${data.amountWords} )`;

  // === BENEFICIARY NAME & ADDRESS ===
  const benAddrEl = findExact("GRAND TRADING L.L.C FZ MEYDAN GRANDSTAND 6 TH  FLOOR MEYDAN ROAD, NAD AL SHEBA, DUBAI, U.A.E.");
  if (benAddrEl) benAddrEl.textContent = `${data.beneficiaryName} ${data.beneficiaryAddress}`;

  // === BENEFICIARY BANK ACCOUNT ===
  replaceExact("3708498512402(USD)", data.beneficiaryAcNo);

  // === BENEFICIARY BANK NAME ===
  replaceExact("EMIRATES ISLAMIC BANK P.J.S.C. DEIRA, DUBAI", data.beneficiaryBank);

  // === IBAN ===
  replaceExact("AE600340003708498512402(USD)", data.ibanNo);

  // === SWIFT CODE ===
  replaceExact("MEBLAEADXXX", data.swiftCode);

  // === SWIFT/ABA/ROUTING/SORT LINE ===
  const swiftVal = findExact("MEBLAEADXXX");
  if (swiftVal) swiftVal.textContent = data.swiftCode;

  // === EXPECTED DISPATCH DATE ===
  replaceExact("30.06.2026", data.expectedDispatchDate);

  // === SHIPPING COMPANY ===
  replaceExact("Name of the shipping  company -", `Name of the shipping  company - ${data.shippingCompany || ""}`);

  // === PORT OF DISPATCH ===
  replaceExact("APAPA, NIGERIA", data.portOfDispatch);

  // === DESTINATION PORT ===
  replaceExact("MUNDRA, INDIA", data.destinationPort);

  // === PROFORMA INVOICE NO ===
  const invNoEl = findExact("GTL/GEI/00");
  if (invNoEl) {
    const para = parentPara(invNoEl);
    if (para) {
      const runs = siblingRuns(para);
      const labelIdx = runs.findIndex((r) => getText(r).includes("Invoice no"));
      if (labelIdx >= 0) {
        for (let j = labelIdx + 1; j < runs.length; j++) runs[j].textContent = "";
        if (labelIdx + 1 < runs.length) runs[labelIdx + 1].textContent = data.proformaInvNo;
      }
    }
  }

  // === PROFORMA DATE ===
  replaceExact("01/06/2026", data.proformaInvDate);

  // === PROFORMA AMOUNT ===
  const pfAmountEl = findExact("64,265.57");
  if (pfAmountEl) {
    const para = parentPara(pfAmountEl);
    if (para) {
      const runs = siblingRuns(para);
      for (const r of runs) r.textContent = "";
      runs[0].textContent = `USD  ${data.proformaInvAmount}`;
    }
  }

  // === GOODS DESCRIPTION & HSN ===
  const goodsHsnEl = findExact("Aluminum  scrap Tense as per ISRI   ( HSN CODE 76020010)");
  if (goodsHsnEl) goodsHsnEl.textContent = `${data.goodsDescription} ( HSN CODE ${data.hsnCode})`;

  // === COUNTRY OF ORIGIN ===
  replaceExact("NIGERIA", data.countryOfOrigin);

  // === IMPORT LICENSE ===
  replaceExact("N.A.", data.importLicenseDetails);

  // === SPECIAL REF NO ===
  const refNoEl = findExact("N.A.");
  if (refNoEl) refNoEl.textContent = data.specialRefNo;

  // Serialize back
  const serializer = new XMLSerializer();
  docXml = serializer.serializeToString(xmlDoc);

  zip.file("word/document.xml", docXml);
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `PAYMENT_ADVICE_${data.proformaInvNo.replace(/\//g, "_")}.docx`);
}
