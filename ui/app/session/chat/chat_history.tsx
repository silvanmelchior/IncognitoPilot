import { Message } from "@/llm/base";
import { TbUser } from "react-icons/tb";
import Image from "next/image";
import robotIcon from "../../icon.png";
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
                <Image src={robotIcon} alt="robot" width={36} priority />
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
      <div ref={bottomRef} />
    </div>
  );
}
