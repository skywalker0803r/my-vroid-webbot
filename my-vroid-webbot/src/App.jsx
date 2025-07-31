// App.jsx
import React, { useState } from "react";
import VRMViewer from "./VRMViewer";
import ChatBox from "./ChatBox";
import { speakText } from "./tts";
import { sendMessage } from "./api";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [latestReply, setLatestReply] = useState(""); // 新增狀態來儲存最新的回覆

  const handleUserMessage = async (message) => {
    setMessages((prev) => [...prev, { from: "user", text: message }]);
    const reply = await sendMessage(message);
    setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    setLatestReply(reply); // 在收到回覆時更新狀態
    speakText(reply);
    
    // 清除 latestReply 狀態，以便下次重新觸發動作
    setTimeout(() => {
        setLatestReply("");
    }, 4000);
  };

  return (
    // 新的佈局，使用 Flexbox 讓整個 App 置中
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="flex w-full max-w-4xl h-[80vh] border rounded-lg overflow-hidden shadow-lg">
        <div className="w-2/3 bg-black">
          <VRMViewer modelUrl="model.vrm" latestReply={latestReply} /> {/* 傳遞 latestReply */}
        </div>
        <div className="w-1/3 p-4 flex flex-col">
          <ChatBox messages={messages} onSend={handleUserMessage} />
        </div>
      </div>
    </div>
  );
}