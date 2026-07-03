import { InvoiceData, CompanyType } from "@/types";

export const defaultInvoiceDataGrand: InvoiceData = {
  company: "grand",
  seller: "GRAND TRADING L.L.C FZ",
  sellerAddress:
    "MEYDAN GRANDSTAND, 6TH FLOOR, MEYDAN ROAD, NAD AL SHEBA, DUBAI, U.A.E.",
  invoiceNo: "GTL/GEI/001/26-27",
  date: "20/04/2026",
  incoTerms: "CNF",
  buyer: "GIREXIM INTERNATIONAL PVT LTD",
  buyerAddress:
    "502, BUSINESS SQUARE, TAPOVAN, NEAR ZANZARDA CHOWKDI, ZANZARDA ROAD, JUNAGADH - 362001, INDIA",
  gstNo: "24AAMCG3269L1Z6",
  mo: "9978302386",
  email: "gireximinternationalpvtltd@gmail.com",
  countryOfOrigin: "NIGERIA",
  portOfLoading: "APAPA, NIGERIA",
  portOfDischarge: "MUNDRA PORT, GUJARAT, INDIA",
  notifyParty: "",
  paymentTerms: "100% ADVANCE PAYMENT OR PARTIALLY PAYMENT ALLOWED",
  vesselName: "MAERSK MEGALOPOLIS 616E",
  draftBlNo: "268783156",
  iecNo: "2416903306",
  sBillNo: "",
  containerNo: "",
  markAndNo: "",
  descriptionOfGoods: "ALUMINIUM SCRAP",
  noOfBags: "",
  quantity: "27.185",
  rate: "2265",
  amount: "61,574.00",
  hsnCode: "76020010",
  valueInWords:
    "USD SIXTY-ONE THOUSAND FIVE HUNDRED SEVENTY-FOUR AND FIFTY CENTS ONLY",
  bankName: "GRAND TRADING L.L.C-FZ",
  bankBranch: "EMIRATES ISLAMIC BANK P.J.S.C., DEIRA, DUBAI",
  ibanNo: "AE600340003708498512402(USD)",
  accountNo: "3708498512402(USD)",
  swiftCode: "MEBLAEADXXX",
  declaration:
    "WE DECLARE THAT THIS INVOICE SHOWS THE ACTUAL PRICE OF GOODS DESCRIBED AND ALL THE PERTICULARS ARE TRUE AND CORRECT.",
  companyEmail: "grandbusiness2024@gmail.com",
  companyPhone: "+971 50 280 0736",
  containers: [],
};

export const defaultInvoiceDataWinner: InvoiceData = {
  company: "winner",
  seller: "WINNER TRADING FZ-LLC",
  sellerAddress:
    "AL SHOHADA ROAD, AL HAMRA INDUSTRIAL ZONE-FZ, RAS AL KHAIMAH, UNITED ARAB EMIRATES",
  invoiceNo: "WTFL/GIR/02/26-27",
  date: "10/04/2026",
  incoTerms: "CNF",
  buyer: "GIREXIM INTERNATIONAL PVT LTD",
  buyerAddress:
    "502, BUSINESS SQUARE, TAPOVAN, NEAR ZANZARDA BYPASS CHOWKDI, ZANZARDA ROAD, JUNAGADH - 362001, INDIA",
  gstNo: "24AAMCG3269L1Z6",
  mo: "9978302386",
  email: "info.gireximinternationalpvtltd@gmail.com",
  countryOfOrigin: "NIGERIA",
  portOfLoading: "APAPA PORT",
  portOfDischarge: "MUNDRA PORT",
  notifyParty: "",
  paymentTerms: "100% ADVANCE PAYMENT OR PARTIALLY PAYMENT ALLOWED",
  vesselName: "MAERSK SEADREAM 618E",
  draftBlNo: "270366184",
  iecNo: "2416903306",
  sBillNo: "",
  containerNo: "MRSU7463153",
  markAndNo: "",
  descriptionOfGoods: "RAW CASHEW NUT IN SHELL",
  noOfBags: "",
  quantity: "27.802",
  rate: "1182.85",
  amount: "32,885.61",
  hsnCode: "08013100",
  valueInWords:
    "USD THIRTY TWO THOUSAND EIGHT HUNDRED EIGHTY FIVE AND SIXTY ONE CENTS ONLY",
  bankName: "WINNER TRADING FZ-LLC",
  bankBranch: "NATIONAL BANK OF FUJAIRAH, RAS AL KHAIMAH, U.A.E.",
  ibanNo: "AE090380000012990137348",
  accountNo: "012990137348 (USD)",
  swiftCode: "NBFUAEAF",
  declaration:
    "WE DECLARE THAT THIS INVOICE SHOWS THE ACTUAL PRICE OF GOODS DESCRIBED AND ALL THE PERTICULARS ARE TRUE AND CORRECT.",
  companyEmail: "info.winnertrading@gmail.com",
  companyPhone: "+971 50 123 4567",
  containers: [],
};

export const defaultInvoiceData: InvoiceData = { ...defaultInvoiceDataGrand };

export function getInvoiceDefaults(company: CompanyType): InvoiceData {
  return company === "grand"
    ? { ...defaultInvoiceDataGrand }
    : { ...defaultInvoiceDataWinner };
}
