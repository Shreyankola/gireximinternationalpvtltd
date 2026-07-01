import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";
applyPlugin(jsPDF);
import { InvoiceData } from "@/types";

export function exportPdf(data: InvoiceData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 10;
  const pageW = 190;

  let y = margin;

  function br(h: number = 5) {
    y += h;
    if (y > 278) {
      doc.addPage();
      y = margin;
    }
  }

  // --- HEADER decorative bars ---
  doc.setFillColor(217, 217, 217);
  doc.rect(margin, y, 60, 4, "F");
  doc.setFillColor(166, 166, 166);
  doc.rect(margin + 63, y, 55, 4, "F");
  doc.setFillColor(55, 181, 255);
  doc.rect(margin + 121, y, 40, 4, "F");
  doc.setFillColor(32, 41, 50);
  doc.rect(margin + 164, y, 36, 4, "F");
  br(6);

  // Blue address line
  doc.setTextColor(23, 166, 221);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(
    data.sellerAddress.replace(/\n/g, ", "),
    margin,
    y
  );
  doc.setTextColor(0, 0, 0);
  br(6);

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("COMMERCIAL INVOICE", pageW / 2 + margin, y, { align: "center" });
  br(8);

  const col1 = margin;
  const col2 = margin + 85;
  const col3 = margin + 130;
  const labelGap = 18;

  // --- SELLER ---
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("SELLER:", col1, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.seller, col1 + labelGap, y);
  br(4);
  doc.setFontSize(7);
  doc.text(data.sellerAddress, col1, y);
  br(4);

  // Invoice meta on one line
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("COMMERCIAL INVOICE NO:", col1, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.invoiceNo, col1 + 36, y);
  doc.setFont("helvetica", "bold");
  doc.text("DATE:", col2, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.date, col2 + 10, y);
  doc.setFont("helvetica", "bold");
  doc.text("INCO TERMS:", col3, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.incoTerms, col3 + 18, y);
  br(6);

  // --- BUYER ---
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("BUYER:", col1, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.buyer, col1 + labelGap, y);
  br(4);
  doc.setFontSize(7);
  doc.text(data.buyerAddress, col1, y);
  br(4);

  // GST + MO
  doc.setFont("helvetica", "bold");
  doc.text("GST NO:", col1, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.gstNo, col1 + 12, y);
  doc.setFont("helvetica", "bold");
  doc.text("MO:", col2, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.mo, col2 + 6, y);
  br(4);

  // EMAIL
  doc.setFont("helvetica", "bold");
  doc.text("EMAIL:", col1, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.email, col1 + 10, y);
  br(6);

  // Country / Ports
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("COUNTRY OF ORIGIN:", col1, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.countryOfOrigin, col1 + 28, y);
  doc.setFont("helvetica", "bold");
  doc.text("PORT OF LOADING:", col2, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.portOfLoading, col2 + 24, y);
  doc.setFont("helvetica", "bold");
  doc.text("PORT OF DISCHARGE:", col3, y);
  doc.setFont("helvetica", "normal");
  const podText = data.portOfDischarge.length > 15
    ? data.portOfDischarge.substring(0, 15) + "\u2026"
    : data.portOfDischarge;
  doc.text(podText, col3 + 26, y);
  br(6);

  // Notify + Payment
  doc.setFont("helvetica", "bold");
  doc.text("NOTIFY PARTY:", col1, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.notifyParty || "-", col1 + 22, y);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT TERMS:", col2, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.paymentTerms, col2 + 24, y);
  br(6);

  // Vessel
  doc.setFont("helvetica", "bold");
  doc.text("VESSEL NAME:", col1, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.vesselName, col1 + 22, y);
  br(4);

  // Draft BL + S. Bill
  doc.setFont("helvetica", "bold");
  doc.text("DRAFT BL. NO:", col1, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.draftBlNo, col1 + 22, y);
  doc.setFont("helvetica", "bold");
  doc.text("S. BILL NO.:", col2, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.sBillNo || "-", col2 + 20, y);
  br(8);

  // --- GOODS TABLE ---
  const goodsHeaders = [
    ["MARK & NO.", "DESCRIPTION OF GOODS", "NO. BAGS & PACKING", "QUANTITY", "RATE\n(USD/MT.)", "AMOUNT"],
  ];
  const dataRow = [
    data.markAndNo || "-",
    data.descriptionOfGoods,
    data.noOfBags || "-",
    `${data.quantity} MT`,
    data.rate.toString(),
    `$ ${data.amount}`,
  ];
  const hsnRow = [
    { content: `HSN CODE ${data.hsnCode}`, styles: { fontStyle: "bold", fontSize: 7 } },
    { content: "", styles: { fontSize: 7 } },
    { content: "", styles: { fontSize: 7 } },
    { content: `${data.quantity} MT`, styles: { fontStyle: "bold", fontSize: 7, halign: "center" } },
    { content: "", styles: { fontSize: 7 } },
    { content: `$ ${data.amount}`, styles: { fontStyle: "bold", fontSize: 7, halign: "right" } },
  ];
  const totalRow = [
    { content: "TOTAL", colSpan: 3, styles: { halign: "left", fontStyle: "bold", fontSize: 7 } },
    { content: `${data.quantity} MT`, styles: { fontStyle: "bold", fontSize: 7, halign: "center" } },
    { content: "", styles: { fontSize: 7 } },
    { content: `$ ${data.amount}`, styles: { fontStyle: "bold", fontSize: 7, halign: "right" } },
  ];

  (doc as any).autoTable({
    head: goodsHeaders,
    body: [dataRow],
    foot: [hsnRow, totalRow],
    startY: y,
    margin: { left: margin, right: margin },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.3,
    styles: {
      fontSize: 7,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
    },
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: 24, halign: "center" },
      1: { cellWidth: 52 },
      2: { cellWidth: 28, halign: "center" },
      3: { cellWidth: 28, halign: "center" },
      4: { cellWidth: 28, halign: "center" },
      5: { cellWidth: 30, halign: "right" },
    },
    didParseCell: function (data: any) {
      if (data.section === "head" && data.row.index === 0) {
        data.cell.styles.halign = "center";
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 5;

  // Value in Words
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("VALUE IN WORDS:", col1, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(data.valueInWords, col1 + 26, y);
  br(8);

  // --- BANK DETAILS + SIGN & STAMP side by side ---
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("BANK DETAILS", col1, y);
  doc.text("SIGN & STAMP", col2 + 15, y);
  br(5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const bankLines = [
    `NAME: ${data.bankName}`,
    `BANK NAME: ${data.bankBranch}`,
    `IBAN NO: ${data.ibanNo}`,
    `ACCOUNT NO: ${data.accountNo}`,
    `SWIFT CODE: ${data.swiftCode}`,
  ];
  bankLines.forEach((line) => {
    doc.text(line, col1, y);
    br(4);
  });

  const signY = y - bankLines.length * 4 - 5;
  doc.text("_________________________", col2 + 20, signY + 25);
  doc.setFont("helvetica", "bold");
  doc.text("Authorised Signatory", col2 + 20, signY + 31);

  y = Math.max(y, signY + 38) + 4;

  // --- DECLARATION ---
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("DECLARATION:", col1, y);
  br(4);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6);
  doc.text(data.declaration, pageW / 2 + margin, y, { align: "center" });
  br(10);

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text(data.companyEmail, margin, 290);
  doc.text(data.companyPhone, pageW + margin, 290, { align: "right" });

  doc.save(`INVOICE_${data.invoiceNo.replace(/\//g, "_")}.pdf`);
}
