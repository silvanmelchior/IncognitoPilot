import { Message } from "@/llm/base";
import { TbRobot, TbUser } from "react-icons/tb";

export default function ChatHistory({ history }: { history: Message[] }) {
  return (
    <div className="mt-auto">
      {history
        .filter(
          (msg) =>
            msg.role === "user" ||
            (msg.role === "model" && msg.text !== undefined),
        )
        .map((msg, idx) => (
          <div key={idx} className="flex mt-4">
            {msg.role === "model" ? (
              <div className="mr-4 mt-2">
                <TbRobot size={36} />
              </div>
            ) : (
              <div className="flex-1 min-w-[20px]" />
            )}
            <div
              className={
                "bg-white drop-shadow-sm rounded-md p-4" +
                (msg.role === "user" ? " bg-blue-200" : "")
              }
            >
              {msg.text}
            </div>
            {msg.role === "user" ? (
              <div className="ml-4 mt-2">
                <TbUser size={36} />
              </div>
            ) : (
              <div className="flex-1 min-w-[20px]" />
            )}
          </div>
        ))}
    </div>
  );
}
