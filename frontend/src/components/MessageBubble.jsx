import { Bot, User } from "lucide-react";

export function MessageBubble({ role, children }) {
  const isUser = role === "user";
  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      {!isUser && <div className="avatar dark"><Bot size={16} /></div>}
      <div className={`message ${isUser ? "user-message" : "assistant-message"}`}>{children}</div>
      {isUser && <div className="avatar light"><User size={16} /></div>}
    </div>
  );
}
