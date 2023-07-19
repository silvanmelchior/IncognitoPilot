import { Message } from "@/llm/base";

export default function ChatHistory({history}: {history: Message[]}) {
  return (
    <div>
      {history.filter(msg => msg.role === "user" || (msg.role === "model" && msg.text !== undefined)).map((msg, idx) => (
        <div key={idx}>
          {msg.role === "user" ? "You: " : "Model: "}
          {msg.text}
        </div>
      ))}
    </div>
  )
}
