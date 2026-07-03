import JSZip from "jszip";
import { saveAs } from "file-saver";
import { InvoiceData } from "@/types";

function getAllTextElements(xmlDoc: Document): Element[] {
  const result: Element[] = [];
  const all = xmlDoc.getElementsByTagName("*");
  for (let i = 0; i < all.length; i++) {
    if (all[i].localName === "t") result.push(all[i]);
  }
  return result;
}

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
    if (all[i].localName === "t") result.push(all[i] as Element);
  }
  return result;
}

function findExact(tEls: Element[], text: string): Element | null {
  for (let i = 0; i < tEls.length; i++) {
    if (getText(tEls[i]) === text) return tEls[i];
  }
  return null;
}

function replaceExact(tEls: Element[], oldText: string, newText: string): void {
  const el = findExact(tEls, oldText);
  if (el) el.textContent = newText;
}

function replaceLabelValue(tEls: Element[], labelText: string, value: string): void {
  const label = findExact(tEls, labelText);
  if (!label) return;
  const para = parentPara(label);
  if (!para) return;
  const runs = siblingRuns(para);
  const idx = runs.findIndex((r) => getText(r) === labelText);
  if (idx === -1) return;
  for (let j = idx + 1; j < runs.length; j++) runs[j].textContent = "";
  if (idx + 1 < runs.length) runs[idx + 1].textContent = value;
}

function firstParaClear(tEls: Element[], searchText: string, value: string): void {
  const el = findExact(tEls, searchText);
  if (!el) return;
  const para = parentPara(el);
  if (!para) return;
  const runs = siblingRuns(para);
  for (const r of runs) r.textContent = "";
  runs[0].textContent = value;
}

function findParaWithLabel(tEls: Element[], labelText: string): { para: Element; runs: Element[]; idx: number } | null {
  const label = findExact(tEls, labelText);
  if (!label) return null;
  const para = parentPara(label);
  if (!para) return null;
  const runs = siblingRuns(para);
  const idx = runs.findIndex((r) => getText(r) === labelText);
  if (idx === -1) return null;
  return { para, runs, idx };
}

function setValueAfterLabel(tEls: Element[], labelText: string, value: string): void {
  const found = findParaWithLabel(tEls, labelText);
  if (!found) return;
  const { runs, idx } = found;
  for (let j = idx + 1; j < runs.length; j++) runs[j].textContent = "";
  if (idx + 1 < runs.length) runs[idx + 1].textContent = value;
}

function clearParaAndSet(tEls: Element[], searchText: string, newText: string): void {
  const el = findExact(tEls, searchText);
  if (!el) return;
  const para = parentPara(el);
  if (!para) return;
  const runs = siblingRuns(para);
  for (const r of runs) r.textContent = "";
  runs[0].textContent = newText;
}

async function exportGrandCommercial(data: InvoiceData) {
  const response = await fetch("/COMMERCIAL INVOICE GRAND REACTAPP.docx");
  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  let docXml = await zip.file("word/document.xml")!.async("string");

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXml, "text/xml");
  const tEls = getAllTextElements(xmlDoc);

  const sellerAddrLine = data.sellerAddress.replace(/\r?\n/g, ", ").replace(/\r/g, "");
  const buyerAddrLine = data.buyerAddress.replace(/\r?\n/g, ", ").replace(/\r/g, "");

  // Seller name
  replaceExact(tEls, "SELLER: GRAND TRADING L.L.C FZ", `SELLER: ${data.seller}`);

  // Seller address — clear runs in the paragraph containing "MEYDAN GRANDSTAND 6"
  clearParaAndSet(tEls, "MEYDAN GRANDSTAND 6", sellerAddrLine);

  // Buyer
  replaceExact(tEls, "BUYER: GIREXIM INTERNATIONAL PVT LTD", `BUYER: ${data.buyer}`);

  // Buyer address — clear runs in paragraph containing "502, BUSINESS SQUARE, TAPOVAN,"
  clearParaAndSet(tEls, "502, BUSINESS SQUARE, TAPOVAN,", buyerAddrLine);

  // Invoice number — find "GTL/GEI/00" runs and replace with invoiceNo
  for (let i = 0; i < tEls.length; i++) {
    if (getText(tEls[i]) === "GTL/GEI/00") {
      const para = parentPara(tEls[i]);
      if (!para) continue;
      const runs = siblingRuns(para);
      const labelIdx = runs.findIndex((r) => getText(r).includes("INVOICE NO:"));
      if (labelIdx >= 0) {
        for (let j = labelIdx + 1; j < runs.length; j++) runs[j].textContent = "";
        if (labelIdx + 1 < runs.length) runs[labelIdx + 1].textContent = data.invoiceNo;
      }
    }
  }

  // DATE — split as [12][/05/2026] after label [DATE: ]
  setValueAfterLabel(tEls, "DATE: ", data.date);

  // INCO TERMS
  setValueAfterLabel(tEls, "INCO TERMS: ", data.incoTerms);

  // GST NO
  replaceExact(tEls, "GST NO: 24AAMCG3269L1Z6", `GST NO: ${data.gstNo}`);

  // MO
  replaceExact(tEls, " 9978302386", data.mo ? ` ${data.mo}` : "");

  // EMAIL
  replaceExact(tEls, "EMAIL: gireximinternationalpvtltd@gmail.com", `EMAIL: ${data.email}`);

  // COUNTRY OF ORIGIN (label has trailing space)
  setValueAfterLabel(tEls, "COUNTRY OF ORIGIN: ", data.countryOfOrigin);

  // PORT OF LOADING
  setValueAfterLabel(tEls, "PORT OF LOADING: ", data.portOfLoading);

  // PORT OF DISCHARGE
  setValueAfterLabel(tEls, "PORT OF DISCHARGE: ", data.portOfDischarge);

  // NOTIFY PARTY
  setValueAfterLabel(tEls, "NOTIFY PARTY: ", data.notifyParty || "");

  // PAYMENT TERMS (template has typo "PAYMENY")
  setValueAfterLabel(tEls, "PAYMENY TERMS: ", data.paymentTerms);

  // VESSEL NAME — runs are [MAERSK CUBANGO/][620E] after label [VESSEL NAME][: ]
  const vesselLabel = findExact(tEls, "VESSEL NAME");
  if (vesselLabel) {
    const para = parentPara(vesselLabel);
    if (para) {
      const runs = siblingRuns(para);
      const labelIdx = runs.findIndex((r) => getText(r) === "VESSEL NAME");
      if (labelIdx >= 0) {
        for (let j = labelIdx + 2; j < runs.length; j++) runs[j].textContent = "";
        if (labelIdx + 2 < runs.length) runs[labelIdx + 2].textContent = data.vesselName;
      }
    }
  }

  // BL. NO
  setValueAfterLabel(tEls, "BL. NO:", data.draftBlNo);

  // CO.NO (Container No.)
  setValueAfterLabel(tEls, "CO.NO:", data.containerNo || "");

  // HSN Code
  for (const el of tEls) {
    if (getText(el) === "76020010") el.textContent = data.hsnCode;
  }

  // Description of goods — runs are [ALUMINIUM SCRAP ][TENSE AS PER ISRI ]
  for (let i = 0; i < tEls.length; i++) {
    if (getText(tEls[i]) === "ALUMINIUM SCRAP ") {
      const para = parentPara(tEls[i]);
      if (!para) continue;
      const runs = siblingRuns(para);
      for (const r of runs) r.textContent = "";
      runs[0].textContent = data.descriptionOfGoods;
      break;
    }
  }

  // Quantity — runs are [ 27][.][464][ MT], clear and set
  for (let i = 0; i < tEls.length; i++) {
    if (getText(tEls[i]) === " MT") {
      const para = parentPara(tEls[i]);
      if (!para) continue;
      const runs = siblingRuns(para);
      const mtIdx = runs.indexOf(tEls[i]);
      if (mtIdx >= 0) {
        for (let j = 0; j < mtIdx; j++) runs[j].textContent = "";
        runs[mtIdx].textContent = ` ${data.quantity} MT`;
      }
    }
  }

  // Rate — run is [   2186]
  for (let i = 0; i < tEls.length; i++) {
    if (getText(tEls[i]).trim() === "2186") {
      const para = parentPara(tEls[i]);
      if (!para) continue;
      if (para.textContent && para.textContent.includes("RATE")) continue;
      tEls[i].textContent = data.rate;
      break;
    }
  }

  // Amount in goods table — find [$ ] then set next run
  for (let i = 0; i < tEls.length; i++) {
    if (getText(tEls[i]) === "$ ") {
      const el = tEls[i];
      const para = parentPara(el);
      if (!para) continue;
      const runs = siblingRuns(para);
      const dollarIdx = runs.indexOf(el);
      if (dollarIdx >= 0 && runs.length > dollarIdx + 1) {
        const nextText = getText(runs[dollarIdx + 1]);
        if (nextText.replace(/[,.]/g, "").match(/^\d+$/)) {
          for (let j = dollarIdx + 1; j < runs.length; j++) runs[j].textContent = "";
          runs[dollarIdx + 1].textContent = data.amount;
        }
      }
    }
  }

  // Value in words
  const wordsLabel = findExact(tEls, "VALUE IN WORDS: ");
  if (wordsLabel) {
    const para = parentPara(wordsLabel);
    if (para) {
      const runs = siblingRuns(para);
      const idx = runs.indexOf(wordsLabel);
      if (idx >= 0) {
        for (let j = idx + 1; j < runs.length; j++) runs[j].textContent = "";
        runs[idx].textContent = `VALUE IN WORDS: ${data.valueInWords}`;
      }
    }
  }

  // Bank details
  replaceExact(tEls, "GRAND TRADING L.L.C-FZ", data.bankName);
  replaceExact(tEls, "EMIRATES ISLAMIC BANK P.J.S.C.", data.bankBranch);
  replaceExact(tEls, "AE600340003708498512402(USD)", data.ibanNo);
  replaceExact(tEls, "3708498512402(USD)", data.accountNo);
  replaceExact(tEls, "MEBLAEADXXX", data.swiftCode);

  const branchPart1 = findExact(tEls, "DEIRA");
  const branchPart2 = findExact(tEls, ", DUBAI");
  if (branchPart1 && branchPart2) {
    branchPart1.textContent = data.bankBranch;
    branchPart2.textContent = "";
  } else if (branchPart1) {
    branchPart1.textContent = data.bankBranch;
  }

  // Declaration — keep label, replace content
  for (const el of tEls) {
    const txt = getText(el);
    if (txt.includes("WE DECLARE THAT THIS INVOICE") || txt.includes("ACTUAL PRICE OF GOODS")) {
      el.textContent = data.declaration;
      break;
    }
  }

  // Footer email
  replaceExact(tEls, "grandbusiness2024@gmail.com", data.companyEmail);

  // Footer phone
  const phoneEls: Element[] = [];
  for (const el of tEls) {
    const txt = getText(el);
    if (txt === "+971 " || txt === "50 " || txt === "280 " || txt === "0736") {
      phoneEls.push(el);
    }
  }
  if (phoneEls.length >= 4) {
    const paras = phoneEls.map((el) => parentPara(el));
    const firstPara = paras[0];
    if (firstPara && paras.every((p) => p === firstPara)) {
      for (const el of phoneEls) el.textContent = "";
      phoneEls[0].textContent = data.companyPhone;
    } else {
      phoneEls[0].textContent = data.companyPhone;
      for (let j = 1; j < phoneEls.length; j++) phoneEls[j].textContent = "";
    }
  }

  const serializer = new XMLSerializer();
  docXml = serializer.serializeToString(xmlDoc);
  zip.file("word/document.xml", docXml);
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `GTL_COMMERCIAL_INVOICE_${data.invoiceNo.replace(/\//g, "_")}.docx`);
}

function paraJoinText(para: Element): string {
  const runs = siblingRuns(para);
  return runs.map((r) => getText(r)).join("");
}

function findAllParaJoin(tEls: Element[], search: string): Array<{ para: Element; runs: Element[] }> {
  const seen = new Set<Element>();
  const results: Array<{ para: Element; runs: Element[] }> = [];
  for (const el of tEls) {
    const para = parentPara(el);
    if (!para || seen.has(para)) continue;
    seen.add(para);
    if (paraJoinText(para).includes(search)) {
      results.push({ para, runs: siblingRuns(para) });
    }
  }
  return results;
}

function replaceParaRuns(runs: Element[], newText: string): void {
  for (const r of runs) r.textContent = "";
  runs[0].textContent = newText;
}

function replaceAllParaJoin(tEls: Element[], search: string, newText: string): void {
  const matches = findAllParaJoin(tEls, search);
  for (const { runs } of matches) replaceParaRuns(runs, newText);
}

async function exportWinnerCommercial(data: InvoiceData) {
  const response = await fetch("/COMMERCIAL INVOICE WINNER REACTAPP.docx");
  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  let docXml = await zip.file("word/document.xml")!.async("string");

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXml, "text/xml");
  const tEls = getAllTextElements(xmlDoc);

  const sellerAddrLine = data.sellerAddress.replace(/\r?\n/g, " ").replace(/\r/g, "");
  const buyerAddrLine = data.buyerAddress.replace(/\r?\n/g, " ").replace(/\r/g, "");

  // Seller name — paragraph has "WINNER TRADING FZ-LLC"
  replaceAllParaJoin(tEls, "WINNER TRADING FZ-LLC", data.seller);

  // Seller address — avoid matching bank detail address paragraphs
  const sellerAddrParas = findAllParaJoin(tEls, "AL SHOHADA ROAD AL HAMRA INDUSTRIAL ZONE-FZ RAS AL KHAIMAH, UNITED ARAB EMIRATES");
  for (const { runs } of sellerAddrParas) {
    const text = paraJoinText(parentPara(runs[0])!);
    if (text.includes("COMPASS BUILDING")) continue;
    replaceParaRuns(runs, sellerAddrLine);
  }

  // Buyer name — "GIREXIM INTERNATIONAL PVT LTD" (but shares paragraph with address)
  // Find the paragraph containing "GIREXIM" then "502,BUSINESS" — this is buyer name+addr P0
  const buyerNameParas = findAllParaJoin(tEls, "GIREXIM");
  for (const { para, runs } of buyerNameParas) {
    const text = paraJoinText(para);
    if (text.includes("502,BUSINESS") || text.includes("ZANZARDA")) {
      replaceParaRuns(runs, `${data.buyer} ${buyerAddrLine}`);
    }
  }

  // Buyer address P0 is merged with buyer name above; clear P1 (BYPASS CHOWKDI) and subsequent
  const buyerAddrP1 = findAllParaJoin(tEls, "BYPASS CHOWKDI, ZANZARDA ROAD, JUNAGADH -362001");
  for (const { runs } of buyerAddrP1) replaceParaRuns(runs, "");

  const buyerAddrP2 = findAllParaJoin(tEls, "GSTIN:");
  for (const { para } of buyerAddrP2) {
    const gstinPara = para;
    if (!gstinPara) continue;
    const r = siblingRuns(gstinPara);
    const txt = paraJoinText(gstinPara);
    if (txt.includes("IEC:")) {
      const line = `GSTIN: ${data.gstNo}  IEC: ${data.iecNo || "2416903306"}`;
      replaceParaRuns(r, line);
    }
  }

  // Buyer email — paragraph has "EMAIL: info.gireximinternationalpvtltd@gmail.com"
  const emailParas = findAllParaJoin(tEls, "EMAIL:");
  for (const { runs } of emailParas) {
    replaceParaRuns(runs, `EMAIL: ${data.email}`);
  }

  // Invoice number — "WTFL/GIR/02/26-27"
  replaceAllParaJoin(tEls, "WTFL/GIR/02/26-27", data.invoiceNo);

  // Date — "10/04/2026"
  replaceAllParaJoin(tEls, "10/04/2026", data.date);

  // Payment terms — "PAYMENT TERMS : 100% ADVANCE PAYMENT OR PARTIALLY PAYMENT ALLOWED"
  replaceAllParaJoin(tEls, "100% ADVANCE PAYMENT OR PARTIALLY PAYMENT ALLOWED", data.paymentTerms);

  // Inco term — "INCO TERM : CNF"
  replaceAllParaJoin(tEls, "INCO TERM : CNF", `INCO TERM : ${data.incoTerms}`);

  // Country of origin — paragraph with "NIGERIA" but only after "COUNTRY OF ORIGIN" label
  const originParas = findAllParaJoin(tEls, "NIGERIA");
  for (const { para, runs } of originParas) {
    const prevSib = para.previousElementSibling;
    if (prevSib && prevSib.textContent && prevSib.textContent.includes("COUNTRY")) {
      replaceParaRuns(runs, data.countryOfOrigin);
    }
  }

  // Port of loading — paragraph with "APAPA PORT" after "PORT OF LOADING"
  const polParas = findAllParaJoin(tEls, "APAPA");
  for (const { para, runs } of polParas) {
    const prevSib = para.previousElementSibling;
    if (prevSib && prevSib.textContent && prevSib.textContent.includes("LOADING")) {
      replaceParaRuns(runs, data.portOfLoading);
    }
  }

  // Final destination — "INDIA" after "FINAL DESTINATION"
  const destParas = findAllParaJoin(tEls, "INDIA");
  for (const { para, runs } of destParas) {
    const prevSib = para.previousElementSibling;
    if (prevSib && prevSib.textContent && prevSib.textContent.includes("FINAL DESTINATION")) {
      replaceParaRuns(runs, "INDIA");
    }
  }

  // Port of discharge — "MUNDRA PORT" after "PORT OF DISCHARGE"
  const podParas = findAllParaJoin(tEls, "MUNDRA");
  for (const { para, runs } of podParas) {
    const prevSib = para.previousElementSibling;
    if (prevSib && prevSib.textContent && prevSib.textContent.includes("DISCHARGE")) {
      replaceParaRuns(runs, data.portOfDischarge);
    }
  }

  // Product description — "RAW CASHEW NUT ? IN SHELL"
  replaceAllParaJoin(tEls, "RAW CASHEW NUT ? IN SHELL", data.descriptionOfGoods);

  // HSN Code
  replaceAllParaJoin(tEls, "08013100", data.hsnCode);

  // Vessel Name in items section — standalone "-" after "Vessel Name/Voyage Number"
  const dashParas = findAllParaJoin(tEls, "-");
  for (const { para, runs } of dashParas) {
    const prevSib = para.previousElementSibling;
    if (prevSib && prevSib.textContent && prevSib.textContent.includes("Vessel Name")) {
      replaceParaRuns(runs, data.vesselName || "-");
    }
  }

  // B/L value in items section — standalone "-" after "Bill Of Lading No"
  const blDashParas = findAllParaJoin(tEls, "-");
  for (const { para, runs } of blDashParas) {
    const prevSib = para.previousElementSibling;
    if (prevSib && prevSib.textContent && prevSib.textContent.includes("Bill Of Lading")) {
      replaceParaRuns(runs, data.draftBlNo || "-");
    }
  }

  // Quality — "AS PER CONTRACT"
  replaceAllParaJoin(tEls, "AS PER CONTRACT", data.draftBlNo || "AS PER CONTRACT");

  // Quantity
  replaceAllParaJoin(tEls, "27.802", data.quantity);

  // Rate — paragraph "USD 1182.85 / M.T"
  const rateParas = findAllParaJoin(tEls, "1182.85");
  for (const { runs } of rateParas) replaceParaRuns(runs, `USD ${data.rate} / M.T`);

  // Total amount — paragraph "USD 32,885.61"
  const amtParas = findAllParaJoin(tEls, "32,885.61");
  for (const { runs } of amtParas) replaceParaRuns(runs, `USD ${data.amount}`);

  // Amount in words — first paragraph starts with "USD THIRTY"
  const wordsParas = findAllParaJoin(tEls, "USD THIRTY");
  // Also need to clear "FIVE AND SIXTY ONE CENTS ONLY" paragraph
  const wordsParas2 = findAllParaJoin(tEls, "FIVE AND SIXTY ONE CENTS ONLY");
  for (const { runs } of wordsParas) replaceParaRuns(runs, data.valueInWords);
  for (const { runs } of wordsParas2) replaceParaRuns(runs, "");

  // BL No — "270366184"
  replaceAllParaJoin(tEls, "270366184", data.draftBlNo);

  // Vessel Name in footer — "MAERSK SEADREAM 618E"
  replaceAllParaJoin(tEls, "MAERSK SEADREAM 618E", data.vesselName || "");

  // Container No — "MRSU7463153"
  replaceAllParaJoin(tEls, "MRSU7463153", data.containerNo || "");

  // Bank details
  replaceAllParaJoin(tEls, "AE090380000012990137348", data.ibanNo);
  replaceAllParaJoin(tEls, "012990137348 (USD)", data.accountNo);
  replaceAllParaJoin(tEls, "NBFUAEAF", data.swiftCode);
  replaceAllParaJoin(tEls, "NATIONAL BANK OF FUJAIRAH", data.bankBranch);

  // IEC No
  replaceAllParaJoin(tEls, "2416903306", data.iecNo || "2416903306");

  const serializer = new XMLSerializer();
  docXml = serializer.serializeToString(xmlDoc);
  zip.file("word/document.xml", docXml);
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `WINNER_COMMERCIAL_INVOICE_${data.invoiceNo.replace(/\//g, "_")}.docx`);
}

export async function exportWord(data: InvoiceData) {
  if (data.company === "winner") {
    await exportWinnerCommercial(data);
  } else {
    await exportGrandCommercial(data);
  }
}
