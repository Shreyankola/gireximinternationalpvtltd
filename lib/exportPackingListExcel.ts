import { PackingListData } from "@/types";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export async function exportPackingListExcel(data: PackingListData) {
  const response = await fetch("/PACKING LIST DEFAULT.xlsx");
  const buffer = await response.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  function set(ref: string, value: string) {
    const existing = sheet[ref];
    const oldStyle = existing ? (existing as any).s : undefined;
    (sheet[ref] as any) = { t: "str", v: value };
    if (oldStyle !== undefined) {
      (sheet[ref] as any).s = oldStyle;
    }
  }

  // === Left-side blocks (merged cells — write to top-left corner) ===
  set("A2", `EXPORTER: ${data.exporter}\r\n${data.exporterAddress}`);

  const consigneeLines = [
    `CONSIGNEE: ${data.consignee}`,
    data.consigneeAddress,
    `MO: ${data.consigneeMo}`,
    `GST: ${data.consigneeGst}`,
  ].filter(Boolean);
  set("A11", consigneeLines.join("\r\n"));

  set("A19", `NOTIFY PARTY: ${data.notifyParty || "-"}`);

  // === Right side — value cells ===
  set("D3", `${data.invoiceNo}  ${data.date}`);
  set("E4", data.buyerOrderNo || "-");
  set("E6", data.otherExporterDetails || "-");
  set("E8", data.countryOfOrigin);
  set("E9", data.countryOfFinalDestination);
  set("E11", data.termsOfDelivery);
  set("E13", data.portOfLoading);
  set("E15", data.portOfDischarge);
  set("E17", data.containerNo);
  set("E19", data.quantity);
  set("E21", data.modeOfShipment);
  set("E23", data.vesselName);
  set("E25", data.shipmentPeriod);

  // === Goods table data ===
  set("A28", data.srNo);
  set("B28", data.descriptionOfGoods);
  set("C28", data.hsnCode);
  set("D28", data.quantity);
  set("E28", data.packagesNetGross);

  // === Declaration ===
  set("A30", `DECLARATION: ${data.declaration}`);

  // === Bank + Sign ===
  const bankLines = [
    `BANK DETAIL : NAME: ${data.bankName}`,
    `BANK NAME: ${data.bankBranch}`,
    `IBAN NO: ${data.ibanNo}`,
    `ACCOUNT NO: ${data.accountNo}`,
    `SWIFT CODE: ${data.swiftCode}`,
    `EMAIL: ${data.companyEmail}`,
    `PHONE: ${data.companyPhone}`,
  ].filter(Boolean);
  set("A31", bankLines.join("\r\n"));

  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout]), `PACKING_LIST_${data.invoiceNo.replace(/\//g, "_")}.xlsx`);
}
