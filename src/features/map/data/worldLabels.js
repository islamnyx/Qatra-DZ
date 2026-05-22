/** English continent / ocean labels — avoids CARTO tiles showing Chinese or wrong names. */

export const CONTINENT_LABELS = [
  { id: "africa", en: "Africa", ar: "أفريقيا", fr: "Afrique", lat: 7, lng: 18, minZoom: 2, maxZoom: 5 },
  { id: "europe", en: "Europe", ar: "أوروبا", fr: "Europe", lat: 54, lng: 18, minZoom: 2, maxZoom: 5 },
  { id: "asia", en: "Asia", ar: "آسيا", fr: "Asie", lat: 42, lng: 88, minZoom: 2, maxZoom: 5 },
  {
    id: "north-america",
    en: "North America",
    ar: "أمريكا الشمالية",
    fr: "Amérique du Nord",
    lat: 48,
    lng: -98,
    minZoom: 2,
    maxZoom: 5,
  },
  {
    id: "south-america",
    en: "South America",
    ar: "أمريكا الجنوبية",
    fr: "Amérique du Sud",
    lat: -14,
    lng: -58,
    minZoom: 2,
    maxZoom: 5,
  },
  {
    id: "oceania",
    en: "Oceania",
    ar: "أوقيانوسيا",
    fr: "Océanie",
    lat: -22,
    lng: 140,
    minZoom: 2,
    maxZoom: 5,
  },
];

export const OCEAN_LABELS = [
  { id: "atlantic", en: "Atlantic Ocean", ar: "المحيط الأطلسي", fr: "Océan Atlantique", lat: 28, lng: -32, minZoom: 2, maxZoom: 4 },
  { id: "indian", en: "Indian Ocean", ar: "المحيط الهندي", fr: "Océan Indien", lat: -18, lng: 78, minZoom: 2, maxZoom: 4 },
  { id: "arctic", en: "Arctic Ocean", ar: "المحيط المتجمد الشمالي", fr: "Océan Arctique", lat: 78, lng: 0, minZoom: 2, maxZoom: 4 },
  { id: "pacific", en: "Pacific Ocean", ar: "المحيط الهادئ", fr: "Océan Pacifique", lat: 5, lng: -160, minZoom: 2, maxZoom: 3 },
];

/** Maghreb + neighbors — English country names at regional zoom. */
export const REGION_COUNTRY_LABELS = [
  { en: "Morocco", ar: "المغرب", fr: "Maroc", lat: 31.8, lng: -6.5, minZoom: 4, maxZoom: 7 },
  { en: "Algeria", ar: "الجزائر", fr: "Algérie", lat: 28, lng: 2.5, minZoom: 4, maxZoom: 7 },
  { en: "Tunisia", ar: "تونس", fr: "Tunisie", lat: 34, lng: 9.5, minZoom: 5, maxZoom: 8 },
  { en: "Libya", ar: "ليبيا", fr: "Libye", lat: 27, lng: 18, minZoom: 5, maxZoom: 7 },
  { en: "Mauritania", ar: "موريتانيا", fr: "Mauritanie", lat: 20, lng: -10, minZoom: 4, maxZoom: 7 },
  { en: "Western Sahara", ar: "الصحراء الغربية", fr: "Sahara occidental", lat: 24.5, lng: -12, minZoom: 5, maxZoom: 8 },
  { en: "Spain", ar: "إسبانيا", fr: "Espagne", lat: 40, lng: -3.5, minZoom: 5, maxZoom: 8 },
  { en: "France", ar: "فرنسا", fr: "France", lat: 46.5, lng: 2, minZoom: 4, maxZoom: 6 },
  { en: "Italy", ar: "إيطاليا", fr: "Italie", lat: 42.5, lng: 12.5, minZoom: 5, maxZoom: 7 },
  { en: "Egypt", ar: "مصر", fr: "Égypte", lat: 26.5, lng: 30, minZoom: 5, maxZoom: 7 },
];

/** Show CARTO city labels only when zoomed into the Maghreb (no Chinese labels in Asia). */
export const MAGHREB_BOUNDS = {
  south: 18,
  north: 38,
  west: -18,
  east: 12,
};

export function pickLabelText(entry, lang) {
  if (lang === "ar") return entry.ar ?? entry.en;
  if (lang === "fr") return entry.fr ?? entry.en;
  return entry.en;
}
