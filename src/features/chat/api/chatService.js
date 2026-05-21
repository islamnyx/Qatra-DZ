/**
 * Chat team: change UI in ChatPage.jsx; change reply logic here or via Firebase adapter.
 */
import { data } from "../../../services/data/index.js";
import { getDamBotReply, quickPrompts } from "../utils/damBot.js";

export async function fetchPrompts(lang) {
  try {
    const res = await data.getChatPrompts(lang);
    return res.prompts;
  } catch {
    return quickPrompts[lang] ?? quickPrompts.ar;
  }
}

export async function sendChatMessage(text, lang, donor) {
  try {
    const res = await data.sendChat(text, lang, donor?.id);
    return res.reply;
  } catch {
    return getDamBotReply(text, lang, donor);
  }
}
