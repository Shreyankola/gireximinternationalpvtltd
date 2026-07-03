"use client";

import { useState } from "react";
import { TaxInvoiceData } from "@/types";
import { getTaxInvoiceDefaults } from "@/lib/taxInvoiceDefaults";
import { exportTaxInvoiceWord } from "@/lib/exportTaxInvoiceWord";

export default function TaxInvoiceForm() {
  const [data, setData] = useState<TaxInvoiceData>(getTaxInvoiceDefaults());
  const [generating, setGenerating] = useState<string | null>(null);

  const update = (field: keyof TaxInvoiceData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExport = async () => {
    setGenerating("word");
    try {
      await exportTaxInvoiceWord(data);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to generate. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  const resetForm = () => {
    setData(getTaxInvoiceDefaults());
  };

  const field = (label: string, field: keyof TaxInvoiceData, opts?: { rows?: number; span?: boolean }) => (
    <div className={opts?.span ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {opts?.rows ? (
        <textarea
          value={data[field] as string}
          onChange={(e) => update(field, e.target.value)}
          rows={opts.rows}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
        />
      ) : (
        <input
          type="text"
          value={data[field] as string}
          onChange={(e) => update(field, e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-6">
        {/* Seller */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Seller</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Name", "seller", { span: true })}
            {field("Address", "sellerAddress", { span: true, rows: 2 })}
            {field("GST No", "gstNo")}
            {field("PAN", "pan")}
          </div>
        </fieldset>

        {/* Invoice Info */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Invoice Info</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Invoice No", "invoiceNo")}
            {field("Date", "date")}
          </div>
        </fieldset>

        {/* Bill To */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Bill To</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Name", "billTo", { span: true })}
            {field("Address", "billToAddress", { span: true, rows: 2 })}
            {field("GST", "billToGst")}
            {field("PAN", "billToPan")}
          </div>
        </fieldset>

        {/* Ship To */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Ship To</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Name", "shipTo", { span: true })}
            {field("Address", "shipToAddress", { span: true, rows: 2 })}
            {field("GST", "shipToGst")}
            {field("PAN", "shipToPan")}
          </div>
        </fieldset>

        {/* Material / Shipment */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Shipment Details</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Material", "material", { span: true })}
            {field("Container No", "containerNo")}
            {field("No of Containers", "noOfCon")}
            {field("Total Weight", "totalWeight")}
            {field("POL", "pol")}
            {field("POD", "pod")}
          </div>
        </fieldset>

        {/* Item Details */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Item Details</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("SR No", "srNo")}
            {field("HSN Code", "hsnCode")}
            {field("Description of Goods", "descriptionOfGoods", { span: true })}
            {field("QTY (Kg)", "qtyKg")}
            {field("Rate (per Kg)", "rateKg")}
            {field("Amount", "amount")}
          </div>
        </fieldset>

        {/* Tax Calculation */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Tax Calculation</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("CGST 9%", "cgst")}
            {field("SGST 9%", "sgst")}
            {field("Round Off", "roundOff")}
            {field("Grand Total", "grandTotal")}
            {field("Amount in Words", "amountInWords", { span: true })}
          </div>
        </fieldset>

        {/* Bank Details */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Bank Details</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Account Name", "bankName", { span: true })}
            {field("Bank Name", "bankBranchName", { span: true })}
            {field("Account No", "accountNo")}
            {field("IFSC Code", "ifscCode")}
            {field("SWIFT Code", "swiftCodeTax")}
            {field("MICR Code", "micrCode")}
            {field("Branch", "branch", { span: true })}
          </div>
        </fieldset>

        {/* Terms */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Terms & Conditions</legend>
          <div className="grid grid-cols-1 gap-4">
            {data.terms.map((term, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <input
                  type="text"
                  value={term}
                  onChange={(e) => {
                    const newTerms = [...data.terms];
                    newTerms[idx] = e.target.value;
                    setData((prev) => ({ ...prev, terms: newTerms }));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
                <button
                  onClick={() => {
                    const newTerms = data.terms.filter((_, i) => i !== idx);
                    setData((prev) => ({ ...prev, terms: newTerms }));
                  }}
                  className="text-red-400 hover:text-red-600 text-lg leading-none mt-1.5"
                  title="Remove term"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              onClick={() => setData((prev) => ({ ...prev, terms: [...prev.terms, ""] }))}
              className="text-sm text-blue-500 hover:text-blue-700 self-start"
            >
              + Add term
            </button>
          </div>
        </fieldset>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 pb-8">
          <div className="flex gap-3 flex-1 flex-wrap">
            <button
              onClick={handleExport}
              disabled={generating !== null}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {generating === "word" ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              Word
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
  );
}
