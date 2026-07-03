"use client";

import { useState, useEffect } from "react";
import { PackingListData, CompanyType } from "@/types";
import { getPackingListDefaults } from "@/lib/packingListDefaults";
import { exportPackingListWord } from "@/lib/exportPackingListWord";

export default function PackingListForm() {
  const [company, setCompany] = useState<CompanyType>("grand");
  const [data, setData] = useState<PackingListData>({ ...getPackingListDefaults("grand") });
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    setData({ ...getPackingListDefaults(company) });
  }, [company]);

  const update = (field: keyof PackingListData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExport = async () => {
    setGenerating("word");
    try {
      await exportPackingListWord(data);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to generate. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  const resetForm = () => {
    setData({ ...getPackingListDefaults(company) });
  };

  const field = (label: string, field: keyof PackingListData, opts?: { rows?: number; span?: boolean }) => (
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
      {/* Company Dropdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
        <select
          value={company}
          onChange={(e) => setCompany(e.target.value as CompanyType)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white"
        >
          <option value="grand">Grand Trading L.L.C FZ</option>
          <option value="winner">Winner Trading FZ-LLC</option>
        </select>
      </div>

      <div className="space-y-6">
        {/* Exporter */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Exporter</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Exporter Name", "exporter", { span: true })}
            {field("Address", "exporterAddress", { span: true, rows: 2 })}
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

        {/* Consignee */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Consignee (Buyer)</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Name", "consignee", { span: true })}
            {field("Address", "consigneeAddress", { span: true, rows: 2 })}
            {field("Mobile", "consigneeMo")}
            {field("GSTIN", "consigneeGst")}
          </div>
        </fieldset>

        {/* Order & Party */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Order & Party</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Buyer's Order No & Date", "buyerOrderNo")}
            {field("Other Exporter's Details", "otherExporterDetails")}
            {field("Notify Party", "notifyParty", { span: true })}
          </div>
        </fieldset>

        {/* Shipping */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Shipping</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Country of Origin", "countryOfOrigin")}
            {field("Country of Final Destination", "countryOfFinalDestination")}
            {field("Port of Loading", "portOfLoading")}
            {field("Port of Discharge", "portOfDischarge")}
            {field("Terms of Delivery & Payment", "termsOfDelivery", { span: true })}
            {field("Vessel Name", "vesselName")}
            {field("Container No", "containerNo")}
            {field("Mode of Shipment", "modeOfShipment")}
            {field("Shipment Period", "shipmentPeriod")}
          </div>
        </fieldset>

        {/* Goods */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Goods Details</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("SR No", "srNo")}
            {field("Description of Goods", "descriptionOfGoods", { span: true })}
            {field("HSN Code", "hsnCode")}
            {field("Quantity", "quantity")}
            {field("Packages, Nett Weight & Gross Weight", "packagesNetGross", { span: true, rows: 2 })}
          </div>
        </fieldset>

        {/* Declaration */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Declaration</legend>
          {field("Declaration", "declaration", { span: true, rows: 2 })}
        </fieldset>

        {/* Bank Details */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Bank Details</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Name", "bankName", { span: true })}
            {field("Bank Name & Branch", "bankBranch", { span: true })}
            {field("IBAN No", "ibanNo")}
            {field("Account No", "accountNo")}
            {field("SWIFT Code", "swiftCode")}
          </div>
        </fieldset>

        {/* Company Info */}
        <fieldset className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <legend className="text-sm font-semibold text-orange-600 px-2">Company Contact</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Email", "companyEmail")}
            {field("Phone", "companyPhone")}
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
