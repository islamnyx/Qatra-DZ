# Chat team workspace

**You own this folder.** Build DamBot UI and smarter replies here.

## Your files

| File | Your work |
|------|-----------|
| `ChatPage.jsx` | Chat screen layout, bubbles, typing indicator |
| `api/chatService.js` | How messages are sent (REST / Firebase / local AI) |
| `utils/damBot.js` | Offline keyword replies (fallback) |
| `components/` | Add `ChatBubble.jsx`, `QuickReplies.jsx`, etc. |

## Do NOT edit

- `src/pages/Home.jsx`
- `src/features/map/`
- `server/routes/chat.js` unless coordinating with backend lead

## Data flow

```
ChatPage → chatService.sendChatMessage() → data.sendChat() → REST or Firebase adapter
```

Firebase teammate may move AI to Cloud Functions; you keep the same `chatService` API.

## Git branch

```bash
git checkout -b feature/chat
git add src/features/chat/
git commit -m "feat(chat): improve DamBot UI"
git push -u origin feature/chat
```

## Run

Route: bottom nav center → `/chat`
