/**
 * Conversational DamBot — sends message + history for real multi-turn chat.
 */
import { api } from "../../../api/client.js";
import { getApiBase } from "../../../config/env.js";

const OFFLINE_MSG = {
  ar: "⚠️ الخادم غير متصل. شغّل: cd server ثم npm start — ثم أعد تحميل الصفحة.",
  fr: "⚠️ Serveur hors ligne. Lancez: cd server puis npm start.",
  en: "⚠️ API offline. Run: cd server && npm start.",
};

export async function fetchWelcome(lang, donorId) {
  try {
    return await api.getChatWelcome(lang, donorId);
  } catch {
    const name = lang === "fr" ? "" : "";
    return {
      text:
        lang === "fr"
          ? "Bonjour ! 🩸 Posez votre question librement."
          : "مرحباً! 🩸 اكتب سؤالك بحرية — محادثة حقيقية.",
      suggestions:
        lang === "fr"
          ? ["Suis-je éligible ?", "Où donner ?", "Guide app"]
          : ["هل أنا مؤهل؟", "أين أتبرع؟", "كيف أستخدم التطبيق؟"],
    };
  }
}

export async function sendChatMessage(text, lang, donor, apiOnline, history = []) {
  if (!apiOnline) {
    return {
      reply: OFFLINE_MSG[lang] ?? OFFLINE_MSG.ar,
      suggestions: [],
      intent: "offline",
    };
  }

  try {
    const res = await api.sendChat(
      text,
      lang,
      donor?.id ?? "DZ-001",
      history.map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.text,
        intent: m.intent,
      }))
    );
    return {
      reply: res.reply,
      suggestions: res.suggestions ?? [],
      intent: res.intent,
    };
  } catch (err) {
    console.warn("[DamBot]", err.message, getApiBase());
    return {
      reply: (OFFLINE_MSG[lang] ?? OFFLINE_MSG.ar) + `\n(${getApiBase()})`,
      suggestions: [],
      intent: "error",
    };
  }
}
