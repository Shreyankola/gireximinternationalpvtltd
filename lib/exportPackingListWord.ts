import JSZip from "jszip";
import { saveAs } from "file-saver";
import { PackingListData, CompanyType } from "@/types";

async function exportPackingListWordGrand(data: PackingListData) {
  const response = await fetch("/PACKING LIST GRAND REACTAPP.docx");
  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  let docXml = await zip.file("word/document.xml")!.async("string");

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXml, "text/xml");

  function getAllParas(): Element[] {
    const result: Element[] = [];
    const all = xmlDoc.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === "p") result.push(all[i] as Element);
    }
    return result;
  }

  function getParaText(para: Element): string {
    const texts: string[] = [];
    const all = para.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === "t" && all[i].textContent) {
        texts.push(all[i].textContent);
      }
    }
    return texts.join(" ").replace(/\s+/g, " ").trim();
  }

  function findPara(text: string): Element | null {
    const paras = getAllParas();
    for (const p of paras) {
      if (getParaText(p) === text.replace(/\s+/g, " ")) return p;
    }
    return null;
  }

  function findParaStarts(prefix: string): Element | null {
    const paras = getAllParas();
    for (const p of paras) {
      const pt = getParaText(p);
      if (pt.startsWith(prefix.replace(/\s+/g, " "))) return p;
    }
    return null;
  }

  function replaceParaText(para: Element, newText: string): void {
    const all = para.getElementsByTagName("*");
    const runs: Element[] = [];
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === "t") runs.push(all[i] as Element);
    }
    if (runs.length === 0) return;
    for (let i = 1; i < runs.length; i++) runs[i].textContent = "";
    runs[0].textContent = newText;
  }

  function clearPara(para: Element): void {
    const all = para.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === "t") all[i].textContent = "";
    }
  }

  const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

  function makeBold(para: Element): void {
    const all = para.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === "r") {
        const run = all[i] as Element;
        let rPr = run.getElementsByTagNameNS(W_NS, "rPr")[0] as Element;
        if (!rPr) {
          rPr = xmlDoc.createElementNS(W_NS, "w:rPr");
          run.insertBefore(rPr, run.firstChild);
        }
        let bEl = rPr.getElementsByTagNameNS(W_NS, "b")[0] as Element;
        if (!bEl) {
          bEl = xmlDoc.createElementNS(W_NS, "w:b");
          bEl.setAttributeNS(W_NS, "w:val", "1");
          rPr.appendChild(bEl);
        } else {
          bEl.setAttributeNS(W_NS, "w:val", "1");
        }
        break;
      }
    }
  }

  function nextPara(after: Element): Element | null {
    let el = after.nextElementSibling;
    while (el) {
      if (el.localName === "p") return el as Element;
      el = el.nextElementSibling;
    }
    return null;
  }

  const exporterAddrLine = data.exporterAddress.replace(/\r?\n/g, ", ").replace(/\r/g, "");

  // 1. Exporter section
  const exporterPara = findParaStarts("EXPORTER :");
  if (exporterPara) {
    replaceParaText(exporterPara, `EXPORTER : ${data.exporter}`);
    makeBold(exporterPara);
    let next = nextPara(exporterPara);
    let clearedCount = 0;
    while (next && clearedCount < 3) {
      const txt = getParaText(next);
      if (txt && !txt.includes("INVOICE") && !txt.includes("EXPORTER")) {
        replaceParaText(next, clearedCount === 0 ? exporterAddrLine : "");
        clearedCount++;
        next = nextPara(next);
      } else {
        break;
      }
    }
  }

  // 2. Invoice No & Date
  const invPara = findPara("GTL/GEI/004/26-27 12.05.2026");
  if (invPara) {
    replaceParaText(invPara, `${data.invoiceNo}  ${data.date}`);
    makeBold(invPara);
  }

  // 3. Buyer's Order
  const buyerLabel = findParaStarts("Buyer's Order Number");
  if (buyerLabel) {
    const next = nextPara(buyerLabel);
    if (next) replaceParaText(next, data.buyerOrderNo || "-");
  }

  // 4. Other Exporter's Details
  const otherLabel = findParaStarts("Other Exporter");
  if (otherLabel) {
    const next = nextPara(otherLabel);
    if (next) replaceParaText(next, data.otherExporterDetails || "-");
  }

  // 5. Country of Origin
  const originPara = findPara("Nigeria");
  if (originPara) {
    replaceParaText(originPara, data.countryOfOrigin);
  }

  // 6. Country of Final Destination
  const destPara = findPara("India");
  if (destPara) {
    replaceParaText(destPara, data.countryOfFinalDestination);
  }

  // 7. Consignee section
  const consigneeLabel = findParaStarts("CONSIGNEE :");
  if (consigneeLabel) {
    replaceParaText(consigneeLabel, `CONSIGNEE : ${data.consignee}`);
    makeBold(consigneeLabel);
    let next = nextPara(consigneeLabel);
    let line = 0;
    const addrLines = [
      data.consigneeAddress.replace(/\r?\n/g, ", ").replace(/\r/g, ""),
      `MO: ${data.consigneeMo}`,
      `GST: ${data.consigneeGst}`,
    ];
    while (next && line < 4) {
      const txt = getParaText(next);
      if (txt && !txt.includes("Terms") && !txt.includes("Port")) {
        replaceParaText(next, addrLines[line] || "");
        line++;
        next = nextPara(next);
      } else {
        break;
      }
    }
  }

  // 8. Terms of Delivery
  const termsPara = findParaStarts("100 %ADVANCE");
  if (termsPara) {
    replaceParaText(termsPara, data.termsOfDelivery);
    const next = nextPara(termsPara);
    if (next) {
      const txt = getParaText(next);
      if (txt && (txt.includes("PAYMENT") || txt.includes("ALLOWED"))) {
        clearPara(next);
      }
    }
  }

  // 9. Port of Loading
  const loadingPara = findPara("Apapa, Nigeria");
  if (loadingPara) {
    replaceParaText(loadingPara, data.portOfLoading);
  }

  // 10. Port of Discharge
  const dischargePara = findPara("Mundra, Gujarat, India");
  if (dischargePara) {
    replaceParaText(dischargePara, data.portOfDischarge);
  }

  // 11. Container No
  const containerPara = findParaStarts("(1) MRKU6371661");
  if (containerPara) {
    replaceParaText(containerPara, data.containerNo);
  }

  // 12. Notify Party
  const notifyPara = findParaStarts("NOTIFY PARTY");
  if (notifyPara) {
    replaceParaText(notifyPara, `NOTIFY PARTY : ${data.notifyParty || "-"}`);
  }

  // 13. No. & Kind of Pkgs.
  const pkgsPara = findPara("27,464 KGS");
  if (pkgsPara) {
    replaceParaText(pkgsPara, data.quantity);
  }

  // 14. Mode of Shipment
  const modePara = findPara("By sea");
  if (modePara) {
    replaceParaText(modePara, data.modeOfShipment);
  }

  // 15. Vessel name
  const vesselPara = findParaStarts("MAERSK CUBANGO 620E");
  if (vesselPara) {
    replaceParaText(vesselPara, data.vesselName);
  }

  // 16. Shipment Period
  const periodPara = findPara("As per Shipping line");
  if (periodPara) {
    replaceParaText(periodPara, data.shipmentPeriod);
  }

  // 17. SR NO
  const srNoPara = findPara("1");
  if (srNoPara) {
    const parentCell = srNoPara.closest("*[localName='tc']");
    if (parentCell) {
      replaceParaText(srNoPara, data.srNo);
    }
  }

  // 18. Description of Goods
  const descPara = findParaStarts("ALUMINIUM SCRAP TENSE AS PER ISRI");
  if (descPara) {
    replaceParaText(descPara, data.descriptionOfGoods);
  }

  // 19. HSN Code
  const hsnPara = findPara("76020010");
  if (hsnPara) {
    replaceParaText(hsnPara, data.hsnCode);
  }

  // 20. Quantity in goods table
  const qtyPara = findPara("27.464 MT");
  if (qtyPara) {
    replaceParaText(qtyPara, data.quantity);
  }

  // 21. Packages net weight
  const pkg1Para = findParaStarts("NO. OF BAG");
  const pkg2Para = findParaStarts("NET WEIGHT");
  if (pkg1Para && pkg2Para) {
    replaceParaText(pkg1Para, data.packagesNetGross);
    makeBold(pkg1Para);
    clearPara(pkg2Para);
  } else if (pkg1Para) {
    replaceParaText(pkg1Para, data.packagesNetGross);
    makeBold(pkg1Para);
  }

  // 22. Declaration
  const declPara = findParaStarts("Declaration:");
  if (declPara) {
    replaceParaText(declPara, `DECLARATION: ${data.declaration}`);
  }

  // 23. Bank details
  const bankNamePara = findParaStarts("NAME: GRAND TRADING");
  if (bankNamePara) {
    replaceParaText(bankNamePara, `NAME: ${data.bankName}`);
    makeBold(bankNamePara);
  }
  const bankBranchPara = findParaStarts("BANK NAME: EMIRATES");
  if (bankBranchPara) {
    replaceParaText(bankBranchPara, `BANK NAME: ${data.bankBranch}`);
  }
  const ibanPara = findParaStarts("IBAN NO:");
  if (ibanPara) {
    replaceParaText(ibanPara, `IBAN NO: ${data.ibanNo}  ACCOUNT NO: ${data.accountNo}`);
  }
  const swiftPara = findParaStarts("SWIFT CODE:");
  if (swiftPara) {
    replaceParaText(swiftPara, `SWIFT CODE: ${data.swiftCode}`);
  }

  const serializer = new XMLSerializer();
  docXml = serializer.serializeToString(xmlDoc);
  zip.file("word/document.xml", docXml);
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `PACKING_LIST_${data.invoiceNo.replace(/\//g, "_")}.docx`);
}

async function exportPackingListWordWinner(data: PackingListData) {
  const response = await fetch("/PACKING LIST WINNER REACTAPP.docx");
  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  let docXml = await zip.file("word/document.xml")!.async("string");

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXml, "text/xml");

  function getAllParas(): Element[] {
    const result: Element[] = [];
    const all = xmlDoc.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === "p") result.push(all[i] as Element);
    }
    return result;
  }

  function getParaText(para: Element): string {
    const texts: string[] = [];
    const all = para.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === "t" && all[i].textContent) {
        texts.push(all[i].textContent);
      }
    }
    return texts.join(" ").replace(/\s+/g, " ").trim();
  }

  function findPara(text: string): Element | null {
    const paras = getAllParas();
    for (const p of paras) {
      if (getParaText(p) === text.replace(/\s+/g, " ")) return p;
    }
    return null;
  }

  function findParaStarts(prefix: string): Element | null {
    const paras = getAllParas();
    for (const p of paras) {
      const pt = getParaText(p);
      if (pt.startsWith(prefix.replace(/\s+/g, " "))) return p;
    }
    return null;
  }

  function replaceParaText(para: Element, newText: string): void {
    const all = para.getElementsByTagName("*");
    const runs: Element[] = [];
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === "t") runs.push(all[i] as Element);
    }
    if (runs.length === 0) return;
    for (let i = 1; i < runs.length; i++) runs[i].textContent = "";
    runs[0].textContent = newText;
  }

  function clearPara(para: Element): void {
    const all = para.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === "t") all[i].textContent = "";
    }
  }

  const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

  function makeBold(para: Element): void {
    const all = para.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === "r") {
        const run = all[i] as Element;
        let rPr = run.getElementsByTagNameNS(W_NS, "rPr")[0] as Element;
        if (!rPr) {
          rPr = xmlDoc.createElementNS(W_NS, "w:rPr");
          run.insertBefore(rPr, run.firstChild);
        }
        let bEl = rPr.getElementsByTagNameNS(W_NS, "b")[0] as Element;
        if (!bEl) {
          bEl = xmlDoc.createElementNS(W_NS, "w:b");
          bEl.setAttributeNS(W_NS, "w:val", "1");
          rPr.appendChild(bEl);
        } else {
          bEl.setAttributeNS(W_NS, "w:val", "1");
        }
        break;
      }
    }
  }

  function nextPara(after: Element): Element | null {
    let el = after.nextElementSibling;
    while (el) {
      if (el.localName === "p") return el as Element;
      el = el.nextElementSibling;
    }
    return null;
  }

  const exporterAddrLine = data.exporterAddress.replace(/\r?\n/g, ", ").replace(/\r/g, "");

  // 1. Exporter section
  const exporterPara = findParaStarts("EXPORTER :");
  if (exporterPara) {
    replaceParaText(exporterPara, `EXPORTER : ${data.exporter}`);
    makeBold(exporterPara);
    let next = nextPara(exporterPara);
    let clearedCount = 0;
    while (next && clearedCount < 3) {
      const txt = getParaText(next);
      if (txt && !txt.includes("INVOICE") && !txt.includes("EXPORTER")) {
        replaceParaText(next, clearedCount === 0 ? exporterAddrLine : "");
        clearedCount++;
        next = nextPara(next);
      } else {
        break;
      }
    }
  }

  // 2. Invoice No & Date
  const invPara = findPara("WTFL/GIR/01/26-27 10/04/2026");
  if (invPara) {
    replaceParaText(invPara, `${data.invoiceNo}  ${data.date}`);
    makeBold(invPara);
  }

  // 3. Buyer's Order
  const buyerLabel = findParaStarts("Buyer's Order Number");
  if (buyerLabel) {
    const next = nextPara(buyerLabel);
    if (next) replaceParaText(next, data.buyerOrderNo || "-");
  }

  // 4. Other Exporter's Details
  const otherLabel = findParaStarts("Other Exporter");
  if (otherLabel) {
    const next = nextPara(otherLabel);
    if (next) replaceParaText(next, data.otherExporterDetails || "-");
  }

  // 5. Country of Origin
  const originPara = findPara("Nigeria");
  if (originPara) {
    replaceParaText(originPara, data.countryOfOrigin);
  }

  // 6. Country of Final Destination
  const destPara = findPara("India");
  if (destPara) {
    replaceParaText(destPara, data.countryOfFinalDestination);
  }

  // 7. Consignee section
  const consigneeLabel = findParaStarts("CONSIGNEE: -");
  if (consigneeLabel) {
    replaceParaText(consigneeLabel, `CONSIGNEE: ${data.consignee}`);
    makeBold(consigneeLabel);
    let next = nextPara(consigneeLabel);
    let line = 0;
    const addrLines = [
      data.consigneeAddress.replace(/\r?\n/g, ", ").replace(/\r/g, ""),
      `MO: ${data.consigneeMo}`,
      `GST: ${data.consigneeGst}`,
    ];
    while (next && line < 4) {
      const txt = getParaText(next);
      if (txt && !txt.includes("Terms") && !txt.includes("Port")) {
        replaceParaText(next, addrLines[line] || "");
        line++;
        next = nextPara(next);
      } else {
        break;
      }
    }
  }

  // 8. Terms of Delivery
  const termsPara = findParaStarts("100 %ADVANCE");
  if (termsPara) {
    replaceParaText(termsPara, data.termsOfDelivery);
    const next = nextPara(termsPara);
    if (next) {
      const txt = getParaText(next);
      if (txt && (txt.includes("PAYMENT") || txt.includes("ALLOWED"))) {
        clearPara(next);
      }
    }
  }

  // 9. Port of Loading
  const loadingPara = findPara("Apapa, Nigeria");
  if (loadingPara) {
    replaceParaText(loadingPara, data.portOfLoading);
  }

  // 10. Port of Discharge
  const dischargePara = findPara("Mundra, Gujarat, India");
  if (dischargePara) {
    replaceParaText(dischargePara, data.portOfDischarge);
  }

  // 11. Container No
  const containerPara = findParaStarts("(1) MRSU7463153");
  if (containerPara) {
    replaceParaText(containerPara, data.containerNo);
  }

  // 12. Notify Party
  const notifyPara = findParaStarts("NOTIFY PARTY");
  if (notifyPara) {
    replaceParaText(notifyPara, `NOTIFY PARTY : ${data.notifyParty || "-"}`);
  }

  // 13. No. & Kind of Pkgs.
  const pkgsPara = findPara("340 JUTE BAGS");
  if (pkgsPara) {
    replaceParaText(pkgsPara, data.quantity);
  }

  // 14. Mode of Shipment
  const modePara = findPara("By sea");
  if (modePara) {
    replaceParaText(modePara, data.modeOfShipment);
  }

  // 15. Vessel name
  const vesselPara = findParaStarts("MAERSK SEADREAM 618E");
  if (vesselPara) {
    replaceParaText(vesselPara, data.vesselName);
  }

  // 16. BL Number (Winner template uses "BL Number" instead of "Shipment Period")
  const blPara = findPara("270366184");
  if (blPara) {
    replaceParaText(blPara, data.shipmentPeriod || "");
  }

  // 17. SR NO
  const srNoPara = findPara("1");
  if (srNoPara) {
    const parentCell = srNoPara.closest("*[localName='tc']");
    if (parentCell) {
      replaceParaText(srNoPara, data.srNo);
    }
  }

  // 18. Description of Goods
  const descPara = findParaStarts("RAW CASHEW NUT");
  if (descPara) {
    replaceParaText(descPara, data.descriptionOfGoods);
  }

  // 19. HSN Code
  const hsnPara = findPara("08013100");
  if (hsnPara) {
    replaceParaText(hsnPara, data.hsnCode);
  }

  // 20. Quantity
  const qtyPara = findPara("27.802");
  if (qtyPara) {
    replaceParaText(qtyPara, data.quantity);
  }

  // 21. Packages net weight
  const pkg1Para = findParaStarts("NO. OF BAG");
  const pkg2Para = findParaStarts("NET WEIGHT");
  if (pkg1Para && pkg2Para) {
    replaceParaText(pkg1Para, data.packagesNetGross);
    makeBold(pkg1Para);
    clearPara(pkg2Para);
  } else if (pkg1Para) {
    replaceParaText(pkg1Para, data.packagesNetGross);
    makeBold(pkg1Para);
  }

  // 22. Declaration
  const declPara = findParaStarts("Declaration:");
  if (declPara) {
    replaceParaText(declPara, `DECLARATION: ${data.declaration}`);
  }

  // 23. Bank details - Winner National Bank of Fujairah
  const bankNamePara = findParaStarts("IBAN N0 - AE090380000012990137348");
  if (bankNamePara) {
    replaceParaText(bankNamePara, `IBAN NO: ${data.ibanNo}  ACCOUNT NO: ${data.accountNo}`);
  }
  const bankBranchPara = findParaStarts("BANK - NATIONAL BANK");
  if (bankBranchPara) {
    replaceParaText(bankBranchPara, `BANK NAME: ${data.bankBranch}`);
  }
  const swiftPara = findParaStarts("SWIFT CODE - NBFUAEAF");
  if (swiftPara) {
    replaceParaText(swiftPara, `SWIFT CODE: ${data.swiftCode}`);
  }

  const serializer = new XMLSerializer();
  docXml = serializer.serializeToString(xmlDoc);
  zip.file("word/document.xml", docXml);
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `PACKING_LIST_${data.invoiceNo.replace(/\//g, "_")}.docx`);
}

export async function exportPackingListWord(data: PackingListData) {
  if (data.company === "winner") {
    await exportPackingListWordWinner(data);
  } else {
    await exportPackingListWordGrand(data);
  }
}
