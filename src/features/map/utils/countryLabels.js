/** Arabic country names via Intl (ISO 3166-1 alpha-2) — zero extra bundle weight */

let arRegions = null;

function getArRegions() {
  if (!arRegions) {
    try {
      arRegions = new Intl.DisplayNames(["ar"], { type: "region" });
    } catch {
      arRegions = null;
    }
  }
  return arRegions;
}

/** Natural Earth / geo-countries name variants → ISO2 */
const ISO2 = {
  Algeria: "DZ",
  Morocco: "MA",
  "W. Sahara": "EH",
  Tunisia: "TN",
  Libya: "LY",
  Egypt: "EG",
  Mauritania: "MR",
  Mali: "ML",
  Niger: "NE",
  Chad: "TD",
  Sudan: "SD",
  "Western Sahara": "EH",
  Spain: "ES",
  France: "FR",
  Italy: "IT",
  Portugal: "PT",
  "United States of America": "US",
  "United States": "US",
  Canada: "CA",
  Brazil: "BR",
  China: "CN",
  India: "IN",
  Russia: "RU",
  "United Kingdom": "GB",
  Germany: "DE",
  Turkey: "TR",
  Greece: "GR",
  Norway: "NO",
  Sweden: "SE",
  Finland: "FI",
  Poland: "PL",
  Ukraine: "UA",
  Romania: "RO",
  Bulgaria: "BG",
  Serbia: "RS",
  Croatia: "HR",
  Japan: "JP",
  "South Korea": "KR",
  "North Korea": "KP",
  Australia: "AU",
  "New Zealand": "NZ",
  Mexico: "MX",
  Argentina: "AR",
  Chile: "CL",
  Colombia: "CO",
  Peru: "PE",
  Venezuela: "VE",
  "South Africa": "ZA",
  Nigeria: "NG",
  Kenya: "KE",
  Ethiopia: "ET",
  "Saudi Arabia": "SA",
  Iran: "IR",
  Iraq: "IQ",
  Syria: "SY",
  Jordan: "JO",
  Lebanon: "LB",
  Israel: "IL",
  Palestine: "PS",
  Pakistan: "PK",
  Afghanistan: "AF",
  Indonesia: "ID",
  Malaysia: "MY",
  Thailand: "TH",
  Vietnam: "VN",
  Philippines: "PH",
};

const ALPHA3_TO_ISO2 = {
  DZA: "DZ",
  MAR: "MA",
  ESH: "EH",
  TUN: "TN",
  LBY: "LY",
  EGY: "EG",
  MRT: "MR",
  MLI: "ML",
  NER: "NE",
  TCD: "TD",
  SDN: "SD",
  ESP: "ES",
  FRA: "FR",
  ITA: "IT",
  PRT: "PT",
};

export function resolveIso2(feature) {
  const p = feature.properties ?? {};
  const a3 = p["ISO3166-1-Alpha-3"] || p.ISO_A3 || p.adm0_a3;
  if (a3 && ALPHA3_TO_ISO2[a3]) return ALPHA3_TO_ISO2[a3];
  if (a3 === "ESH") return "EH";

  return (
    p.ISO_A2 ||
    p.iso_a2 ||
    p["ISO3166-1-Alpha-2"] ||
    p["ISO_A2_EH"] ||
    p.ADM0_A3?.slice(0, 2) ||
    ISO2[p.NAME || p.name || p.ADMIN] ||
    ISO2[p.ADMIN] ||
    null
  );
}

export function getCountryLabel(feature) {
  const p = feature.properties ?? {};
  const en = (p.NAME || p.name || p.ADMIN || "—").trim();
  const iso2 = resolveIso2(feature);
  let ar = en;
  if (iso2 && iso2 !== "-99" && iso2.length === 2) {
    try {
      ar = getArRegions()?.of(iso2.toUpperCase()) ?? en;
    } catch {
      ar = en;
    }
  }
  return { ar, en, iso2 };
}

export function countryTooltipHtml(ar, en) {
  return `<div class="map-tooltip-bilingual"><div dir="rtl">${ar}</div><div>${en}</div></div>`;
}
