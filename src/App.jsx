// App.jsx
import React, { useState } from "react";
import VRMViewer from "./VRMViewer";
import ChatBox from "./ChatBox";
import { speakText } from "./tts";
import { sendMessage } from "./api";

export default function App() {
  const [messages, setMessages] = useState([]);

  const handleUserMessage = async (message) => {
    setMessages((prev) => [...prev, { from: "user", text: message }]);
    const reply = await sendMessage(message);
    setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    speakText(reply);
  };

  return (
    <div className="flex h-screen">
      <div className="w-2/3 bg-black">
        <VRMViewer />
      </div>
      <div className="w-1/3 p-4 overflow-y-scroll">
        <ChatBox messages={messages} onSend={handleUserMessage} />
      </div>
    </div>
  );
}