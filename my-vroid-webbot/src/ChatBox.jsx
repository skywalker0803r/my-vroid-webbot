// ChatBox.jsx
import React, { useState } from "react";

export default function ChatBox({ messages, onSend }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-2 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={msg.from === "user" ? "text-right" : "text-left"}>
            <span className={msg.from === "user" ? "bg-blue-200 p-2 rounded" : "bg-gray-200 p-2 rounded"}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="輸入訊息..."
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          發送
        </button>
      </form>
    </div>
  );
}