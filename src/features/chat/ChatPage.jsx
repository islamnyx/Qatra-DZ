import { useState, useRef, useEffect, useCallback } from "react";
import BottomNav from "../../components/BottomNav";
import LanguageToggle from "../../components/LanguageToggle";
import { useLanguage } from "../../context/LanguageContext";
import { useDonor } from "../../context/DonorContext";
import { fetchWelcome, sendChatMessage } from "./api/chatService";
import { Bot, Send } from "lucide-react";

function nowTime() {
  return new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" });
}

function TypingIndicator() {
  return (
    <div className="flex justify-end items-center gap-1">
      <div className="rounded-2xl bg-red-100 px-4 py-3 flex gap-1">
        <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function BotMessage({ text }) {
  const parts = text.split(/\n\n+/).filter(Boolean);
  return (
    <div className="space-y-2">
      {parts.map((p, i) => (
        <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap">
          {p}
        </p>
      ))}
    </div>
  );
}

export default function ChatPage() {
  const { t, lang } = useLanguage();
  const { donor, apiOnline } = useDonor();
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const userHasSent = messages.some((m) => m.role === "user");

  const initChat = useCallback(async () => {
    const welcome = await fetchWelcome(lang, donor?.id);
    setMessages([
      {
        id: "welcome",
        role: "bot",
        text: welcome.text,
        time: nowTime(),
        intent: "greeting",
      },
    ]);
    setSuggestions(welcome.suggestions ?? []);
  }, [lang, donor?.id]);

  useEffect(() => {
    initChat();
  }, [initChat]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, suggestions]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
      time: nowTime(),
    };

    const historyForApi = [...messages, userMsg];
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSuggestions([]);
    setTyping(true);

    const minDelay = new Promise((r) => setTimeout(r, 450));

    const fallbackDonor = donor ?? {
      isEligible: true,
      daysUntilEligible: 0,
      bloodType: "O-",
      name: "أمين",
      lastDonation: "",
      id: "DZ-001",
    };

    const [result] = await Promise.all([
      sendChatMessage(trimmed, lang, fallbackDonor, apiOnline, historyForApi),
      minDelay,
    ]);

    const botMsg = {
      id: `b-${Date.now()}`,
      role: "bot",
      text: result.reply,
      time: nowTime(),
      intent: result.intent,
    };

    setMessages((m) => [...m, botMsg]);
    setSuggestions(result.suggestions ?? []);
    setTyping(false);
    inputRef.current?.focus();
  };

  return (
    <div className="mx-auto min-h-screen max-w-sm bg-red-50 pb-24 flex flex-col">
      <header className="border-b border-red-100 bg-white px-4 py-4 shrink-0 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-red-700">{t("chatTitle")}</h1>
              <p className="text-xs text-gray-500">
                {apiOnline ? t("chatLive") : t("chatOffline")}
              </p>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {!apiOnline && (
        <div className="mx-4 mt-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {t("chatOfflineBanner")}
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[88%] rounded-2xl border px-3 py-2.5 ${
                msg.role === "user"
                  ? "border-red-100 bg-white shadow-sm"
                  : "border-red-200 bg-red-600 text-white shadow-md"
              }`}
            >
              {msg.role === "bot" ? <BotMessage text={msg.text} /> : <p className="text-sm leading-relaxed">{msg.text}</p>}
              <p className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-gray-400" : "text-red-200"}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}

        {typing && <TypingIndicator />}

        {!typing && suggestions.length > 0 && (
          <div className="pt-1 pb-2">
            <p className="text-[10px] text-gray-500 mb-2 px-1">{t("chatSuggest")}</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm hover:bg-red-50 active:scale-95 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </main>

      <div className="shrink-0 border-t border-red-100 bg-white px-4 py-3 mb-16">
        {!userHasSent && suggestions.length > 0 && (
          <p className="text-[10px] text-gray-400 mb-2 text-center">{t("chatStarterHint")}</p>
        )}
        <div className="flex items-end gap-2 rounded-2xl border border-red-200 bg-red-50/50 px-3 py-2 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-200">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder={t("chatPlaceholder")}
            className="flex-1 bg-transparent text-sm outline-none resize-none max-h-24 leading-relaxed"
          />
          <button
            type="button"
            disabled={!input.trim() || typing}
            onClick={() => sendMessage(input)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2">{t("chatDisclaimer")}</p>
      </div>
      <BottomNav />
    </div>
  );
}
