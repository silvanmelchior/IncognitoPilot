import { Message } from "@/llm/base";
import { TbRobot, TbUser } from "react-icons/tb";

export default function ChatHistory({history}: {history: Message[]}) {
  if(history.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <TbRobot size={96} color="#bfdbfe" />
        <div className="text-2xl text-blue-200">Incognito Pilot</div>
      </div>
    )
  }
  return (
    <div className="mt-auto">
      {history.filter(msg => msg.role === "user" || (msg.role === "model" && msg.text !== undefined)).map((msg, idx) => (
        <div key={idx} className="flex mt-4">
          {msg.role === "model" ? (
            <div className="flex-0 mr-4 mt-2">
              <TbRobot size={36} />
            </div>
          ) : <div className="flex-1 min-w-[20px]"/>}
          <div className={"flex-0 bg-white drop-shadow-sm rounded-md p-4" + (msg.role === "user" ? " bg-blue-200" : "")}>
            {msg.text}
          </div>
          {msg.role === "user" ? (
            <div className="flex-0 ml-4 mt-2">
              <TbUser size={36} />
            </div>
          ) : <div className="flex-1 min-w-[20px]"/>}
        </div>
      ))}
    </div>
  )
}
