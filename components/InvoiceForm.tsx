"use client";

import { useState, useEffect } from "react";
import { InvoiceData } from "@/types";
import { defaultInvoiceData } from "@/lib/invoiceDefaults";
import { exportWord } from "@/lib/exportWord";
import { amountToWords } from "@/lib/numberToWords";

export default function InvoiceForm() {
  const [data, setData] = useState<InvoiceData>({ ...defaultInvoiceData });
  const [generating, setGenerating] = useState<"word" | null>(null);

  useEffect(() => {
    try {
      const qty = parseFloat(data.quantity);
      const r = parseFloat(data.rate.replace(/,/g, ""));
      if (!isNaN(qty) && !isNaN(r) && qty > 0 && r > 0) {
        const total = qty * r;
        const formatted = total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        setData((prev) => ({ ...prev, amount: formatted }));
      }
    } catch {
      // ignore
    }
  }, [data.quantity, data.rate]);

  useEffect(() => {
    try {
      const words = amountToWords(data.amount);
      setData((prev) => ({ ...prev, valueInWords: words }));
    } catch {
      // ignore invalid input
    }
  }, [data.amount]);

  const update = (field: keyof InvoiceData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExport = async () => {
    setGenerating("word");
    try {
      await exportWord(data);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to generate invoice. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  const resetForm = () => {
    setData({ ...defaultInvoiceData });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left: Form */}
      <div className="flex-1 space-y-6">
        {/* Seller Section */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Seller Information</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Seller Name</label>
              <input
                type="text"
                value={data.seller}
                onChange={(e) => update("seller", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Seller Address</label>
              <textarea
                value={data.sellerAddress}
                onChange={(e) => update("sellerAddress", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
              />
            </div>
          </div>
        </fieldset>

        {/* Invoice Meta */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Invoice Details</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Invoice No.</label>
              <input
                type="text"
                value={data.invoiceNo}
                onChange={(e) => update("invoiceNo", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input
                type="text"
                value={data.date}
                onChange={(e) => update("date", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Inco Terms</label>
              <input
                type="text"
                value={data.incoTerms}
                onChange={(e) => update("incoTerms", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>
        </fieldset>

        {/* Buyer Section */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Buyer Information</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Buyer Name</label>
              <input
                type="text"
                value={data.buyer}
                onChange={(e) => update("buyer", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Buyer Address</label>
              <textarea
                value={data.buyerAddress}
                onChange={(e) => update("buyerAddress", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">GST No.</label>
              <input
                type="text"
                value={data.gstNo}
                onChange={(e) => update("gstNo", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
              <input
                type="text"
                value={data.mo}
                onChange={(e) => update("mo", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="text"
                value={data.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>
        </fieldset>

        {/* Shipping Section */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Shipping Information</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Country of Origin</label>
              <input
                type="text"
                value={data.countryOfOrigin}
                onChange={(e) => update("countryOfOrigin", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Port of Loading</label>
              <input
                type="text"
                value={data.portOfLoading}
                onChange={(e) => update("portOfLoading", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Port of Discharge</label>
              <input
                type="text"
                value={data.portOfDischarge}
                onChange={(e) => update("portOfDischarge", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vessel Name</label>
              <input
                type="text"
                value={data.vesselName}
                onChange={(e) => update("vesselName", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Draft BL No.</label>
              <input
                type="text"
                value={data.draftBlNo}
                onChange={(e) => update("draftBlNo", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">S. Bill No.</label>
              <input
                type="text"
                value={data.sBillNo}
                onChange={(e) => update("sBillNo", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notify Party</label>
              <input
                type="text"
                value={data.notifyParty}
                onChange={(e) => update("notifyParty", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Payment Terms</label>
              <input
                type="text"
                value={data.paymentTerms}
                onChange={(e) => update("paymentTerms", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>
        </fieldset>



        {/* Goods Section */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Goods Details</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description of Goods</label>
              <input
                type="text"
                value={data.descriptionOfGoods}
                onChange={(e) => update("descriptionOfGoods", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">HSN Code</label>
              <input
                type="text"
                value={data.hsnCode}
                onChange={(e) => update("hsnCode", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mark &amp; No.</label>
              <input
                type="text"
                value={data.markAndNo}
                onChange={(e) => update("markAndNo", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">No. of Bags &amp; Packing</label>
              <input
                type="text"
                value={data.noOfBags}
                onChange={(e) => update("noOfBags", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity (MT)</label>
              <input
                type="text"
                value={data.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rate (USD/MT)</label>
              <input
                type="text"
                value={data.rate}
                onChange={(e) => update("rate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount (USD)</label>
              <input
                type="text"
                value={data.amount}
                onChange={(e) => update("amount", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>
        </fieldset>

        {/* Value in Words */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Value</legend>
          <label className="block text-xs font-medium text-gray-600 mb-1">Value in Words</label>
          <textarea
            value={data.valueInWords}
            onChange={(e) => update("valueInWords", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
          />
        </fieldset>

        {/* Bank Details */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Bank Details</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bank Name (Account Holder)</label>
              <input
                type="text"
                value={data.bankName}
                onChange={(e) => update("bankName", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bank Branch</label>
              <input
                type="text"
                value={data.bankBranch}
                onChange={(e) => update("bankBranch", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">IBAN No.</label>
              <input
                type="text"
                value={data.ibanNo}
                onChange={(e) => update("ibanNo", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Account No.</label>
              <input
                type="text"
                value={data.accountNo}
                onChange={(e) => update("accountNo", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SWIFT Code</label>
              <input
                type="text"
                value={data.swiftCode}
                onChange={(e) => update("swiftCode", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>
        </fieldset>

        {/* Declaration */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Declaration</legend>
          <textarea
            value={data.declaration}
            onChange={(e) => update("declaration", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
          />
        </fieldset>

        {/* Company Contact */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Company Contact</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="text"
                value={data.companyEmail}
                onChange={(e) => update("companyEmail", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input
                type="text"
                value={data.companyPhone}
                onChange={(e) => update("companyPhone", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
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
              {generating === "word" ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              Generate Word
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
