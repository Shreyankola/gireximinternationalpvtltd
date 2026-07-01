export interface ContainerRecord {
  id: string;
  blNo: string;
  title: string;
  description: string;
  containerCount: string;
  createdAt: number;
  updatedAt: number;
}

export interface ContainerInfo {
  id: string;
  blNo: string;
  title: string;
  containerCount: string;
  description: string;
  selected?: boolean;
}

export interface PackingListData {
  exporter: string;
  exporterAddress: string;
  invoiceNo: string;
  date: string;
  consignee: string;
  consigneeAddress: string;
  consigneeMo: string;
  consigneeGst: string;
  buyerOrderNo: string;
  otherExporterDetails: string;
  notifyParty: string;
  countryOfOrigin: string;
  countryOfFinalDestination: string;
  portOfLoading: string;
  portOfDischarge: string;
  termsOfDelivery: string;
  vesselName: string;
  containerNo: string;
  modeOfShipment: string;
  shipmentPeriod: string;
  srNo: string;
  descriptionOfGoods: string;
  hsnCode: string;
  quantity: string;
  packagesNetGross: string;
  declaration: string;
  bankName: string;
  bankBranch: string;
  ibanNo: string;
  accountNo: string;
  swiftCode: string;
  companyEmail: string;
  companyPhone: string;
}

export interface PaymentAdviceData {
  date: string;
  goodsDescription: string;
  customerName: string;
  customerAddress: string;
  iec: string;
  inrAcNo: string;
  fcyAcNo: string;
  amount: string;
  amountWords: string;
  beneficiaryName: string;
  beneficiaryAddress: string;
  beneficiaryAcNo: string;
  beneficiaryBank: string;
  ibanNo: string;
  swiftCode: string;
  aba: string;
  routingNo: string;
  sortCode: string;
  expectedDispatchDate: string;
  shippingCompany: string;
  portOfDispatch: string;
  destinationPort: string;
  proformaInvNo: string;
  proformaInvDate: string;
  proformaInvAmount: string;
  hsnCode: string;
  countryOfOrigin: string;
  importLicenseDetails: string;
  specialRefNo: string;
  rateContract: string;
  // radio/checkbox options
  paymentType: "advance" | "direct";
  remittanceType: "swift" | "dd";
  chargesAcType: "onus" | "beneficiary";
  fcyCharges: "onus" | "beneficiary" | "fullvalue";
  // boe details
  boeNo: string;
  boeDate: string;
  boeCcy: string;
  boeAmount: string;
  boeUtilized: string;
  fobValue: string;
  adCode: string;
  portCode: string;
  // declarations
  boeDeclaration: boolean;
  boeDirectDetails: boolean;
  ofacDeclaration: boolean;
  fatfDeclaration: boolean;
  eefcDeclaration: boolean;
  spfcDeclaration: boolean;
  partPayment: boolean;
  femaDeclaration: boolean;
  femaRestricted: boolean;
  notUnderInvestigation: boolean;
  // documents attached
  docProformaInvoice: boolean;
  docPurchaseOrder: boolean;
  docTransport: boolean;
  docBoe: boolean;
  docFormA2: boolean;
  docDelayedPayment: boolean;
  docOriginalLicense: boolean;
  docBankGuarantee: boolean;
  docOther: boolean;
  docOtherText: string;
  // part payment
  partPaymentReason: string;
  billRefNo: string;
  partPaymentCcy: string;
  partPaymentAmount: string;
  companyName: string;
  authorizedSignatory: string;
}

export interface PerformaInvoiceData {
  seller: string;
  sellerAddress: string;
  invoiceNo: string;
  date: string;
  incoTerms: string;
  buyer: string;
  buyerAddress: string;
  gstNo: string;
  mo: string;
  email: string;
  countryOfOrigin: string;
  portOfLoading: string;
  portOfDischarge: string;
  notifyParty: string;
  paymentTerms: string;
  shippingTerms: string;
  blNo: string;
  sBillNo: string;
  markAndNo: string;
  noOfBags: string;
  descriptionOfGoods: string;
  hsnCode: string;
  quantity: string;
  rate: string;
  amount: string;
  valueInWords: string;
  bankName: string;
  bankBranch: string;
  ibanNo: string;
  accountNo: string;
  swiftCode: string;
  declaration: string;
  companyEmail: string;
  companyPhone: string;
}

export interface InvoiceData {
  seller: string;
  sellerAddress: string;
  invoiceNo: string;
  date: string;
  incoTerms: string;
  buyer: string;
  buyerAddress: string;
  gstNo: string;
  mo: string;
  email: string;
  countryOfOrigin: string;
  portOfLoading: string;
  portOfDischarge: string;
  notifyParty: string;
  paymentTerms: string;
  vesselName: string;
  draftBlNo: string;
  sBillNo: string;
  markAndNo: string;
  descriptionOfGoods: string;
  noOfBags: string;
  quantity: string;
  rate: string;
  amount: string;
  hsnCode: string;
  valueInWords: string;
  bankName: string;
  bankBranch: string;
  ibanNo: string;
  accountNo: string;
  swiftCode: string;
  declaration: string;
  companyEmail: string;
  companyPhone: string;
  containers: ContainerInfo[];
}
