import { useLanguage } from "../context/LanguageContext";

export default function LanguageToggle() {
  const { lang, toggle } = useLanguage();
  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700"
    >
      {lang === "ar" ? "FR" : "ع"}
    </button>
  );
}
