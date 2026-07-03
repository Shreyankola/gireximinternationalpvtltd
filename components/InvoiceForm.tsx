"use client";

import { useState, useEffect } from "react";
import { InvoiceData, PerformaInvoiceData, CompanyType } from "@/types";
import { getInvoiceDefaults } from "@/lib/invoiceDefaults";
import { getPerformaInvoiceDefaults } from "@/lib/performaInvoiceDefaults";
import { exportWord } from "@/lib/exportWord";
import { exportPerformaInvoiceWord } from "@/lib/exportPerformaInvoiceWord";
import { amountToWords } from "@/lib/numberToWords";

type DocType = "commercial" | "proforma";

export default function InvoiceForm() {
  const [company, setCompany] = useState<CompanyType>("grand");
  const [docType, setDocType] = useState<DocType>("commercial");

  const [data, setData] = useState<any>({ ...getInvoiceDefaults("grand"), company: "grand" });
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    try {
      const qty = parseFloat((data as any).quantity);
      const r = parseFloat((data as any).rate.replace(/,/g, ""));
      if (!isNaN(qty) && !isNaN(r) && qty > 0 && r > 0) {
        const total = qty * r;
        const formatted = total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        setData((prev: any) => ({ ...prev, amount: formatted }));
      }
    } catch { }
  }, [(data as any).quantity, (data as any).rate]);

  useEffect(() => {
    try {
      const words = amountToWords((data as any).amount);
        setData((prev: any) => ({ ...prev, valueInWords: words }));
    } catch { }
  }, [(data as any).amount]);

  const update = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleExport = async () => {
    setGenerating("generating");
    try {
      if (docType === "commercial") {
        await exportWord(data as InvoiceData);
      } else {
        await exportPerformaInvoiceWord(data as PerformaInvoiceData);
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to generate. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  const resetForm = () => {
    if (docType === "commercial") {
      setData(getInvoiceDefaults(company));
    } else {
      setData(getPerformaInvoiceDefaults(company));
    }
  };

  const label = docType === "commercial" ? "Commercial Invoice" : "Proforma Invoice";

  const field = (label: string, field: string, opts?: { rows?: number; span?: boolean }) => (
    <div className={opts?.span ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {opts?.rows ? (
        <textarea
          value={(data as any)[field] || ""}
          onChange={(e) => update(field, e.target.value)}
          rows={opts.rows}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
        />
      ) : (
        <input
          type="text"
          value={(data as any)[field] || ""}
          onChange={(e) => update(field, e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
          <select
            value={company}
            onChange={(e) => {
              const c = e.target.value as CompanyType;
              setCompany(c);
              const defs = docType === "commercial"
                ? getInvoiceDefaults(c)
                : getPerformaInvoiceDefaults(c);
              setData({ ...defs, company: c });
            }}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white"
          >
            <option value="grand">Grand Trading L.L.C FZ</option>
            <option value="winner">Winner Trading FZ-LLC</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Document Type</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocType)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white"
          >
            <option value="commercial">Commercial Invoice</option>
            <option value="proforma">Proforma Invoice</option>
          </select>
        </div>
      </div>

      {/* Form fields */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {/* Seller Section */}
          <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <legend className="text-sm font-semibold text-orange-600 px-2">Seller Information</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Seller Name</label>
                <input type="text" value={(data as any).seller} onChange={(e) => update("seller", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Seller Address</label>
                <textarea value={(data as any).sellerAddress} onChange={(e) => update("sellerAddress", e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none" />
              </div>
            </div>
          </fieldset>

          {/* Invoice Meta */}
          <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <legend className="text-sm font-semibold text-orange-600 px-2">Invoice Details</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Invoice No.</label>
                <input type="text" value={(data as any).invoiceNo} onChange={(e) => update("invoiceNo", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input type="text" value={(data as any).date} onChange={(e) => update("date", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Inco Terms</label>
                <input type="text" value={(data as any).incoTerms} onChange={(e) => update("incoTerms", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
            </div>
          </fieldset>

          {/* Buyer Section */}
          <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <legend className="text-sm font-semibold text-orange-600 px-2">Buyer Information</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Buyer Name</label>
                <input type="text" value={(data as any).buyer} onChange={(e) => update("buyer", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Buyer Address</label>
                <textarea value={(data as any).buyerAddress} onChange={(e) => update("buyerAddress", e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">GST No.</label>
                <input type="text" value={(data as any).gstNo} onChange={(e) => update("gstNo", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
                <input type="text" value={(data as any).mo} onChange={(e) => update("mo", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="text" value={(data as any).email} onChange={(e) => update("email", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
            </div>
          </fieldset>

          {/* Shipping Section */}
          <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <legend className="text-sm font-semibold text-orange-600 px-2">Shipping Information</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Country of Origin</label>
                <input type="text" value={(data as any).countryOfOrigin} onChange={(e) => update("countryOfOrigin", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Port of Loading</label>
                <input type="text" value={(data as any).portOfLoading} onChange={(e) => update("portOfLoading", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Port of Discharge</label>
                <input type="text" value={(data as any).portOfDischarge} onChange={(e) => update("portOfDischarge", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{docType === "commercial" ? "Vessel Name" : "Notify Party"}</label>
                <input type="text" value={(data as any)[docType === "commercial" ? "vesselName" : "notifyParty"] || ""} onChange={(e) => update(docType === "commercial" ? "vesselName" : "notifyParty", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              {docType === "commercial" ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Draft BL No.</label>
                    <input type="text" value={(data as any).draftBlNo || ""} onChange={(e) => update("draftBlNo", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">S. Bill No.</label>
                    <input type="text" value={(data as any).sBillNo || ""} onChange={(e) => update("sBillNo", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">BL No.</label>
                    <input type="text" value={(data as any).blNo || ""} onChange={(e) => update("blNo", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">S. Bill No.</label>
                    <input type="text" value={(data as any).sBillNo || ""} onChange={(e) => update("sBillNo", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Shipping Terms</label>
                    <input type="text" value={(data as any).shippingTerms || ""} onChange={(e) => update("shippingTerms", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Vessel Name</label>
                    <input type="text" value={(data as any).vesselName || ""} disabled className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Container No.</label>
                <input type="text" value={(data as any).containerNo || ""} onChange={(e) => update("containerNo", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Payment Terms</label>
                <input type="text" value={(data as any).paymentTerms} onChange={(e) => update("paymentTerms", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notify Party</label>
                <input type="text" value={(data as any).notifyParty || ""} onChange={(e) => update("notifyParty", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
            </div>
          </fieldset>

          {/* Goods Section */}
          <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <legend className="text-sm font-semibold text-orange-600 px-2">Goods Details</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Description of Goods</label>
                <input type="text" value={(data as any).descriptionOfGoods} onChange={(e) => update("descriptionOfGoods", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">HSN Code</label>
                <input type="text" value={(data as any).hsnCode} onChange={(e) => update("hsnCode", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mark &amp; No.</label>
                <input type="text" value={(data as any).markAndNo || ""} onChange={(e) => update("markAndNo", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">No. of Bags &amp; Packing</label>
                <input type="text" value={(data as any).noOfBags || ""} onChange={(e) => update("noOfBags", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Quantity (MT)</label>
                <input type="text" value={(data as any).quantity} onChange={(e) => update("quantity", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rate (USD/MT)</label>
                <input type="text" value={(data as any).rate} onChange={(e) => update("rate", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Amount (USD)</label>
                <input type="text" value={(data as any).amount} onChange={(e) => update("amount", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
            </div>
          </fieldset>

          {/* Value in Words */}
          <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <legend className="text-sm font-semibold text-orange-600 px-2">Value</legend>
            <label className="block text-xs font-medium text-gray-600 mb-1">Value in Words</label>
            <textarea value={(data as any).valueInWords} onChange={(e) => update("valueInWords", e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none" />
          </fieldset>

          {/* Bank Details */}
          <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <legend className="text-sm font-semibold text-orange-600 px-2">Bank Details</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bank Name (Account Holder)</label>
                <input type="text" value={(data as any).bankName} onChange={(e) => update("bankName", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bank Branch</label>
                <input type="text" value={(data as any).bankBranch} onChange={(e) => update("bankBranch", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">IBAN No.</label>
                <input type="text" value={(data as any).ibanNo} onChange={(e) => update("ibanNo", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Account No.</label>
                <input type="text" value={(data as any).accountNo} onChange={(e) => update("accountNo", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">SWIFT Code</label>
                <input type="text" value={(data as any).swiftCode} onChange={(e) => update("swiftCode", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
            </div>
          </fieldset>

          {/* Declaration */}
          <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <legend className="text-sm font-semibold text-orange-600 px-2">Declaration</legend>
            <textarea value={(data as any).declaration} onChange={(e) => update("declaration", e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none" />
          </fieldset>

          {/* Company Contact */}
          <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <legend className="text-sm font-semibold text-orange-600 px-2">Company Contact</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="text" value={(data as any).companyEmail} onChange={(e) => update("companyEmail", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input type="text" value={(data as any).companyPhone} onChange={(e) => update("companyPhone", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
            </div>
          </fieldset>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 pb-8">
            <div className="flex gap-3 flex-1">
              <button
                onClick={handleExport}
                disabled={generating !== null}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {generating !== null ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                Generate {label}
              </button>
            </div>
            <button
              onClick={resetForm}
              className="px-6 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
