// tts.js
export function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-TW";
  speechSynthesis.speak(utterance);
}
