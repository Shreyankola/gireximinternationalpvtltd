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
