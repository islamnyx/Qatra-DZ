import { useState, useRef, useEffect } from "react";
import BottomNav from "../components/BottomNav";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../context/LanguageContext";
import { getDamBotReply, quickPrompts } from "../utils/damBot";
import { Bot, Send } from "lucide-react";

function nowTime() {
  return new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" });
}

export default function Chat() {
  const { t, lang } = useLanguage();
  const [messages, setMessages] = useState([
    { id: 1, role: "bot", text: lang === "fr" ? "Bonjour ! Je suis DamBot." : "مرحباً! أنا DamBot.", time: nowTime() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { id: Date.now(), role: "user", text: trimmed, time: nowTime() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { id: Date.now() + 1, role: "bot", text: getDamBotReply(trimmed, lang), time: nowTime() }]);
      setTyping(false);
    }, 600);
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
              <p className="text-xs text-gray-500">{t("chatSubtitle")}</p>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>
      <div className="px-4 py-2 flex gap-2 overflow-x-auto shrink-0">
        {(quickPrompts[lang] ?? quickPrompts.ar).map((p) => (
          <button key={p} type="button" onClick={() => sendMessage(p)} className="shrink-0 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700">{p}</button>
        ))}
      </div>
      <main className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[85%] rounded-2xl border px-3 py-2 ${msg.role === "user" ? "border-red-100 bg-white" : "border-red-200 bg-red-600 text-white"}`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-gray-400" : "text-red-200"}`}>{msg.time}</p>
            </div>
          </div>
        ))}
        {typing && <div className="flex justify-end"><div className="rounded-2xl bg-red-100 px-4 py-2 text-sm text-red-600">...</div></div>}
        <div ref={endRef} />
      </main>
      <div className="shrink-0 border-t border-red-100 bg-white px-4 py-3 mb-16">
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 px-3 py-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage(input)} placeholder={t("chatPlaceholder")} className="flex-1 bg-transparent text-sm outline-none" />
          <button type="button" onClick={() => sendMessage(input)} className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600">
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2">{t("chatDisclaimer")}</p>
      </div>
      <BottomNav />
    </div>
  );
}
