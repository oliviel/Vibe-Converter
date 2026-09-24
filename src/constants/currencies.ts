export type CurrencyKind = "fiat" | "crypto";

export type CurrencyOption = {
  id: string;
  code: string;
  name: string;
  icon: string;
  kind: CurrencyKind;
  /** Value of one unit of this currency in US dollars. */
  usdRate: number;
  rank?: number;
};

export const POPULAR_FIAT_CODES = [
  "COP", "USD", "EUR", "MXN", "DOP", "ARS", "BRL", "CLP", "VES", "PEN",
  "CNY", "JPY", "CRC", "CAD", "GBP", "CHF", "AUD", "INR", "KRW", "ZAR",
];

const COUNTRY_PAIRS = `
AED:AE AFN:AF ALL:AL AMD:AM ANG:CW AOA:AO ARS:AR AUD:AU AWG:AW AZN:AZ
BAM:BA BBD:BB BDT:BD BGN:BG BHD:BH BIF:BI BMD:BM BND:BN BOB:BO BRL:BR
BSD:BS BTN:BT BWP:BW BYN:BY BZD:BZ CAD:CA CDF:CD CHF:CH CLF:CL CLP:CL
CNH:CN CNY:CN COP:CO CRC:CR CUP:CU CVE:CV CZK:CZ DJF:DJ DKK:DK DOP:DO
DZD:DZ EGP:EG ERN:ER ETB:ET EUR:EU FJD:FJ FKP:FK FOK:FO GBP:GB GEL:GE
GGP:GG GHS:GH GIP:GI GMD:GM GNF:GN GTQ:GT GYD:GY HKD:HK HNL:HN HRK:HR
HTG:HT HUF:HU IDR:ID ILS:IL IMP:IM INR:IN IQD:IQ IRR:IR ISK:IS JEP:JE
JMD:JM JOD:JO JPY:JP KES:KE KGS:KG KHR:KH KID:KI KMF:KM KRW:KR KWD:KW
KYD:KY KZT:KZ LAK:LA LBP:LB LKR:LK LRD:LR LSL:LS LYD:LY MAD:MA MDL:MD
MGA:MG MKD:MK MMK:MM MNT:MN MOP:MO MRU:MR MUR:MU MVR:MV MWK:MW MXN:MX
MYR:MY MZN:MZ NAD:NA NGN:NG NIO:NI NOK:NO NPR:NP NZD:NZ OMR:OM PAB:PA
PEN:PE PGK:PG PHP:PH PKR:PK PLN:PL PYG:PY QAR:QA RON:RO RSD:RS RUB:RU
RWF:RW SAR:SA SBD:SB SCR:SC SDG:SD SEK:SE SGD:SG SHP:SH SLE:SL SLL:SL
SOS:SO SRD:SR SSP:SS STN:ST SYP:SY SZL:SZ THB:TH TJS:TJ TMT:TM TND:TN
TOP:TO TRY:TR TTD:TT TVD:TV TWD:TW TZS:TZ UAH:UA UGX:UG USD:US UYU:UY
UZS:UZ VES:VE VND:VN VUV:VU WST:WS XAF:CM XCD:AG XCG:CW XDR:UN
XOF:SN XPF:PF YER:YE ZAR:ZA ZMW:ZM ZWG:ZW ZWL:ZW
`;

const COUNTRY_BY_CURRENCY = Object.fromEntries(
  COUNTRY_PAIRS.trim().split(/\s+/).map((pair) => pair.split(":")),
) as Record<string, string>;

const FALLBACK_NAMES: Record<string, string> = {
  ARS: "Argentine Peso", BRL: "Brazilian Real", CAD: "Canadian Dollar",
  CLP: "Chilean Peso", CNY: "Chinese Yuan", COP: "Colombian Peso",
  CRC: "Costa Rican Colón", DOP: "Dominican Peso", EUR: "Euro",
  GBP: "British Pound", JPY: "Japanese Yen", MXN: "Mexican Peso",
  PEN: "Peruvian Sol", USD: "US Dollar", VES: "Venezuelan Bolívar",
};

export function getCurrencyName(code: string) {
  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "currency" });
    const name = displayNames.of(code);
    if (name && name !== code) return name;
  } catch {
    // Older JavaScript runtimes may not include Intl.DisplayNames.
  }
  return FALLBACK_NAMES[code] ?? code;
}

export function getCurrencyFlag(code: string) {
  const countryCode = COUNTRY_BY_CURRENCY[code];
  if (!countryCode) return "¤";
  return countryCode
    .toUpperCase()
    .split("")
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}

export function getCryptoIcon(symbol: string) {
  const known: Record<string, string> = {
    BTC: "₿", ETH: "Ξ", USDT: "₮", USDC: "$", BNB: "B", XRP: "X",
    SOL: "S", ADA: "A", DOGE: "Ð", DOT: "●", LTC: "Ł", BCH: "₿",
  };
  return known[symbol] ?? symbol.slice(0, 1);
}

export const INITIAL_CURRENCIES: CurrencyOption[] = [
  { id: "fiat:DOP", code: "DOP", name: "Dominican Peso", icon: "🇩🇴", kind: "fiat", usdRate: 1 / 58.96 },
  { id: "fiat:USD", code: "USD", name: "US Dollar", icon: "🇺🇸", kind: "fiat", usdRate: 1 },
  { id: "fiat:COP", code: "COP", name: "Colombian Peso", icon: "🇨🇴", kind: "fiat", usdRate: 1 / 3173 },
  { id: "fiat:MXN", code: "MXN", name: "Mexican Peso", icon: "🇲🇽", kind: "fiat", usdRate: 1 / 17.22 },
  { id: "fiat:BRL", code: "BRL", name: "Brazilian Real", icon: "🇧🇷", kind: "fiat", usdRate: 1 / 5.13 },
];

export const FALLBACK_FIAT_CURRENCIES: CurrencyOption[] = [
  ...INITIAL_CURRENCIES,
  { id: "fiat:EUR", code: "EUR", name: "Euro", icon: "🇪🇺", kind: "fiat", usdRate: 1.15 },
  { id: "fiat:ARS", code: "ARS", name: "Argentine Peso", icon: "🇦🇷", kind: "fiat", usdRate: 1 / 1515 },
  { id: "fiat:CLP", code: "CLP", name: "Chilean Peso", icon: "🇨🇱", kind: "fiat", usdRate: 1 / 959 },
  { id: "fiat:VES", code: "VES", name: "Venezuelan Bolívar", icon: "🇻🇪", kind: "fiat", usdRate: 1 / 852 },
  { id: "fiat:PEN", code: "PEN", name: "Peruvian Sol", icon: "🇵🇪", kind: "fiat", usdRate: 1 / 3.37 },
  { id: "fiat:CNY", code: "CNY", name: "Chinese Yuan", icon: "🇨🇳", kind: "fiat", usdRate: 1 / 6.71 },
  { id: "fiat:JPY", code: "JPY", name: "Japanese Yen", icon: "🇯🇵", kind: "fiat", usdRate: 1 / 157.35 },
  { id: "fiat:CRC", code: "CRC", name: "Costa Rican Colón", icon: "🇨🇷", kind: "fiat", usdRate: 1 / 447.5 },
  { id: "fiat:CAD", code: "CAD", name: "Canadian Dollar", icon: "🇨🇦", kind: "fiat", usdRate: 1 / 1.4 },
];

export const FALLBACK_CRYPTO_CURRENCIES: CurrencyOption[] = [
  { id: "crypto:btc-bitcoin", code: "BTC", name: "Bitcoin", icon: "₿", kind: "crypto", usdRate: 60000, rank: 1 },
  { id: "crypto:eth-ethereum", code: "ETH", name: "Ethereum", icon: "Ξ", kind: "crypto", usdRate: 3000, rank: 2 },
  { id: "crypto:usdt-tether", code: "USDT", name: "Tether", icon: "₮", kind: "crypto", usdRate: 1, rank: 3 },
  { id: "crypto:bnb-binance-coin", code: "BNB", name: "BNB", icon: "B", kind: "crypto", usdRate: 600, rank: 4 },
  { id: "crypto:sol-solana", code: "SOL", name: "Solana", icon: "S", kind: "crypto", usdRate: 150, rank: 5 },
];
