import { Message } from "@/app/session/communication/message";
import { TbUser } from "react-icons/tb";
import React from "react";

export default function ChatHistory({ history }: { history: Message[] }) {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [history]);

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
              <div className="mr-4 mt-2 min-w-[36px]">
                <img src="./icon.png" alt="robot" width={36} />
              </div>
            ) : (
              <div className="flex-1 min-w-[20px]" />
            )}
            <div
              className={
                "drop-shadow-sm rounded-md p-4 whitespace-pre-wrap " +
                (msg.role === "user" ? "bg-blue-100" : "bg-white")
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
      <div ref={bottomRef} />
    </div>
  );
}
