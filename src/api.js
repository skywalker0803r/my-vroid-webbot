// api.js
export async function sendMessage(message) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.error("API error:", err);
    return "哎呀，好像出了點問題～";
  }
}