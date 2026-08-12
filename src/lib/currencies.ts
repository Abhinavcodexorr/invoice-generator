export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

/** Common ISO currencies used in the invoice settings selector */
export const CURRENCIES: CurrencyOption[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
  { code: "TWD", symbol: "NT$", name: "Taiwan Dollar" },
];

/** Keep only valid ISO 4217-ish codes; fall back to USD. */
export function normalizeCurrency(code: string | null | undefined): string {
  const value = String(code ?? "")
    .trim()
    .toUpperCase();
  if (/^[A-Z]{3}$/.test(value)) return value;
  return "USD";
}

export function getCurrencySymbol(code: string): string {
  const normalized = normalizeCurrency(code);
  return CURRENCIES.find((c) => c.code === normalized)?.symbol ?? normalized;
}

export function formatMoney(amount: number, currency: string): string {
  const code = normalizeCurrency(currency);
  const n = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${getCurrencySymbol(code)} ${n.toFixed(2)}`;
  }
}

/**
 * PDF-safe money format (Helvetica / WinAnsi).
 * Uses familiar symbols when the glyph is available; otherwise ISO code.
 */
export function formatMoneyPdf(amount: number, currency: string): string {
  const code = normalizeCurrency(currency);
  const n = Number.isFinite(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

  const asciiPrefix: Record<string, string> = {
    USD: "$",
    CAD: "C$",
    AUD: "A$",
    NZD: "NZ$",
    HKD: "HK$",
    SGD: "S$",
    MXN: "MX$",
    GBP: "£",
    EUR: "EUR ",
    INR: "INR ",
    JPY: "JPY ",
    CNY: "CNY ",
    CHF: "CHF ",
  };

  return `${asciiPrefix[code] ?? `${code} `}${formatted}`;
}
