"use client";

import { useState } from "react";
import { PaymentAdviceData } from "@/types";
import { defaultPaymentAdviceData } from "@/lib/paymentAdviceDefaults";
import { exportPaymentAdviceWord } from "@/lib/exportPaymentAdviceWord";

export default function PaymentAdviceForm() {
  const [data, setData] = useState<PaymentAdviceData>({ ...defaultPaymentAdviceData });
  const [generating, setGenerating] = useState<"word" | null>(null);

  const update = <K extends keyof PaymentAdviceData>(field: K, value: PaymentAdviceData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExport = async () => {
    setGenerating("word");
    try {
      await exportPaymentAdviceWord(data);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to generate. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  const resetForm = () => {
    setData({ ...defaultPaymentAdviceData });
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200";
  const labelClass = "block text-xs font-medium text-gray-600 mb-1";
  const sectionClass = "bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm";
  const legendClass = "text-sm font-semibold text-orange-600 px-2";

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-6">
        {/* Payment Type */}
        <fieldset className={sectionClass}>
          <legend className={legendClass}>Payment Type</legend>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="paymentType" checked={data.paymentType === "advance"} onChange={() => update("paymentType", "advance")} className="accent-orange-500" />
              ADVANCE
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="paymentType" checked={data.paymentType === "direct"} onChange={() => update("paymentType", "direct")} className="accent-orange-500" />
              DIRECT
            </label>
          </div>
        </fieldset>

        {/* Customer Info */}
        <fieldset className={sectionClass}>
          <legend className={legendClass}>Customer Information</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <input type="text" value={data.date} onChange={(e) => update("date", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Goods Description</label>
              <input type="text" value={data.goodsDescription} onChange={(e) => update("goodsDescription", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Customer Name</label>
              <input type="text" value={data.customerName} onChange={(e) => update("customerName", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Customer Address</label>
              <textarea value={data.customerAddress} onChange={(e) => update("customerAddress", e.target.value)} rows={2} className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className={labelClass}>IEC</label>
              <input type="text" value={data.iec} onChange={(e) => update("iec", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>INR A/C No.</label>
              <input type="text" value={data.inrAcNo} onChange={(e) => update("inrAcNo", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>FCY A/C No.</label>
              <input type="text" value={data.fcyAcNo} onChange={(e) => update("fcyAcNo", e.target.value)} className={inputClass} />
            </div>
          </div>
        </fieldset>

        {/* Remittance */}
        <fieldset className={sectionClass}>
          <legend className={legendClass}>Remittance</legend>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="remittanceType" checked={data.remittanceType === "swift"} onChange={() => update("remittanceType", "swift")} className="accent-orange-500" />
              Swift
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="remittanceType" checked={data.remittanceType === "dd"} onChange={() => update("remittanceType", "dd")} className="accent-orange-500" />
              Demand Draft
            </label>
          </div>
        </fieldset>

        {/* Amount */}
        <fieldset className={sectionClass}>
          <legend className={legendClass}>Amount</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Amount (USD)</label>
              <input type="text" value={data.amount} onChange={(e) => update("amount", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Amount in Words</label>
              <textarea value={data.amountWords} onChange={(e) => update("amountWords", e.target.value)} rows={2} className={`${inputClass} resize-none`} />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="chargesAcType" checked={data.chargesAcType === "onus"} onChange={() => update("chargesAcType", "onus")} className="accent-orange-500" />
              On us - A/C No: {data.inrAcNo}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="chargesAcType" checked={data.chargesAcType === "beneficiary"} onChange={() => update("chargesAcType", "beneficiary")} className="accent-orange-500" />
              Net off i.e. On beneficiary
            </label>
          </div>
        </fieldset>

        {/* Beneficiary */}
        <fieldset className={sectionClass}>
          <legend className={legendClass}>Beneficiary Details</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Beneficiary Name</label>
              <input type="text" value={data.beneficiaryName} onChange={(e) => update("beneficiaryName", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Beneficiary Address</label>
              <textarea value={data.beneficiaryAddress} onChange={(e) => update("beneficiaryAddress", e.target.value)} rows={2} className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className={labelClass}>Bank A/C No.</label>
              <input type="text" value={data.beneficiaryAcNo} onChange={(e) => update("beneficiaryAcNo", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Bank Name & Address</label>
              <input type="text" value={data.beneficiaryBank} onChange={(e) => update("beneficiaryBank", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>IBAN No.</label>
              <input type="text" value={data.ibanNo} onChange={(e) => update("ibanNo", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>SWIFT Code</label>
              <input type="text" value={data.swiftCode} onChange={(e) => update("swiftCode", e.target.value)} className={inputClass} />
            </div>
          </div>
        </fieldset>

        {/* Foreign Bank Charges */}
        <fieldset className={sectionClass}>
          <legend className={legendClass}>Foreign Bank Charges</legend>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="fcyCharges" checked={data.fcyCharges === "onus"} onChange={() => update("fcyCharges", "onus")} className="accent-orange-500" />
              On us
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="fcyCharges" checked={data.fcyCharges === "beneficiary"} onChange={() => update("fcyCharges", "beneficiary")} className="accent-orange-500" />
              On beneficiary
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="fcyCharges" checked={data.fcyCharges === "fullvalue"} onChange={() => update("fcyCharges", "fullvalue")} className="accent-orange-500" />
              Full Value
            </label>
          </div>
        </fieldset>

        {/* Shipment */}
        <fieldset className={sectionClass}>
          <legend className={legendClass}>Shipment Details</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Expected Dispatch Date</label>
              <input type="text" value={data.expectedDispatchDate} onChange={(e) => update("expectedDispatchDate", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Shipping Company</label>
              <input type="text" value={data.shippingCompany} onChange={(e) => update("shippingCompany", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Port of Dispatch</label>
              <input type="text" value={data.portOfDispatch} onChange={(e) => update("portOfDispatch", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Destination Port</label>
              <input type="text" value={data.destinationPort} onChange={(e) => update("destinationPort", e.target.value)} className={inputClass} />
            </div>
          </div>
        </fieldset>

        {/* Proforma Invoice */}
        <fieldset className={sectionClass}>
          <legend className={legendClass}>Proforma Invoice Details</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Invoice No.</label>
              <input type="text" value={data.proformaInvNo} onChange={(e) => update("proformaInvNo", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <input type="text" value={data.proformaInvDate} onChange={(e) => update("proformaInvDate", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Amount</label>
              <input type="text" value={data.proformaInvAmount} onChange={(e) => update("proformaInvAmount", e.target.value)} className={inputClass} />
            </div>
          </div>
        </fieldset>

        {/* Goods & HS Code */}
        <fieldset className={sectionClass}>
          <legend className={legendClass}>Goods & HS Code</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Goods Description</label>
              <input type="text" value={data.goodsDescription} onChange={(e) => update("goodsDescription", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>HSN Code</label>
              <input type="text" value={data.hsnCode} onChange={(e) => update("hsnCode", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Country of Origin</label>
              <input type="text" value={data.countryOfOrigin} onChange={(e) => update("countryOfOrigin", e.target.value)} className={inputClass} />
            </div>
          </div>
        </fieldset>

        {/* Declarations */}
        <fieldset className={sectionClass}>
          <legend className={legendClass}>Declarations</legend>
          <div className="space-y-2">
            {[
              ["boeDeclaration", "BOE Declaration for Advance Remittance"],
              ["ofacDeclaration", "OFAC Declaration"],
              ["notUnderInvestigation", "Not under investigation"],
              ["femaDeclaration", "FEMA Declaration"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={data[key as keyof PaymentAdviceData] as boolean} onChange={(e) => update(key as keyof PaymentAdviceData, e.target.checked)} className="mt-0.5 accent-orange-500" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Documents Attached */}
        <fieldset className={sectionClass}>
          <legend className={legendClass}>Documents Attached</legend>
          <div className="space-y-2">
            {[
              ["docProformaInvoice", "Proforma Invoice (accepted by importer) / Commercial Invoice"],
              ["docPurchaseOrder", "Purchase order raised by us duly accepted by the Foreign Party"],
              ["docTransport", "Transport Document (AWB / B/L / Courier Receipt)"],
              ["docBoe", "Copy of Bill Of Entry"],
              ["docFormA2", "Form A2 for Software Import Transactions"],
              ["docDelayedPayment", "Delayed payment reason (if after 180 days)"],
              ["docOriginalLicense", "Original License (Exchange control copy)"],
              ["docBankGuarantee", "Original Bank Guarantee (if > USD 200,000)"],
              ["docOther", "Any Other document"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={data[key as keyof PaymentAdviceData] as boolean} onChange={(e) => update(key as keyof PaymentAdviceData, e.target.checked)} className="mt-0.5 accent-orange-500" />
                {label}
              </label>
            ))}
            {data.docOther && (
              <input type="text" value={data.docOtherText} onChange={(e) => update("docOtherText", e.target.value)} placeholder="Specify..." className={`${inputClass} mt-1`} />
            )}
          </div>
        </fieldset>

        {/* Signatory */}
        <fieldset className={sectionClass}>
          <legend className={legendClass}>Signatory</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Company Name</label>
              <input type="text" value={data.companyName} onChange={(e) => update("companyName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Authorized Signatory</label>
              <input type="text" value={data.authorizedSignatory} onChange={(e) => update("authorizedSignatory", e.target.value)} className={inputClass} />
            </div>
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 pb-8">
          <div className="flex gap-3 flex-1">
            <button onClick={handleExport} disabled={generating !== null} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
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
          <button onClick={resetForm} className="px-6 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200 transition-colors">
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}
