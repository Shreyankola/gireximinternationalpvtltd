const ones = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];

function convertHundreds(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  if (h > 0) parts.push(ones[h] + " HUNDRED");
  const r = n % 100;
  if (r > 0) {
    if (r < 20) parts.push(ones[r]);
    else {
      const t = Math.floor(r / 10);
      const o = r % 10;
      parts.push(tens[t] + (o > 0 ? "-" + ones[o] : ""));
    }
  }
  return parts.join(" ") || "ZERO";
}

const units = ["", "THOUSAND", "MILLION", "BILLION"];

function convertInteger(n: number): string {
  if (n === 0) return "ZERO";
  const parts: string[] = [];
  let i = 0;
  while (n > 0) {
    const chunk = n % 1000;
    if (chunk > 0) {
      const words = convertHundreds(chunk);
      parts.unshift(words + (units[i] ? " " + units[i] : ""));
    }
    n = Math.floor(n / 1000);
    i++;
  }
  return parts.join(" ");
}

export function amountToWords(amountStr: string): string {
  const clean = amountStr.replace(/,/g, "").trim();
  const parts = clean.split(".");
  const intPart = parseInt(parts[0] || "0", 10);
  const centPart = parts[1] ? parseInt(parts[1].padEnd(2, "0").slice(0, 2), 10) : 0;

  const dollars = convertInteger(intPart);
  const cents = centPart > 0 ? convertInteger(centPart) : "ZERO";

  return `USD ${dollars} AND ${cents} CENTS ONLY`;
}
