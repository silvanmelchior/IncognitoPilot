import React from "react";
import { BiSend } from "react-icons/bi";
import thinkingImg from "./thinking.gif";
import Image from "next/image";

export default function ChatInput({
  innerRef,
  disabled,
  llmAnimation,
  onMessage,
}: {
  innerRef: React.MutableRefObject<HTMLInputElement | null>;
  disabled: boolean;
  llmAnimation: boolean;
  onMessage: (message: string) => void;
}) {
  const [message, setMessage] = React.useState<string>("");

  const canSend = !disabled && message.length > 0;

  const onSend = () => {
    if (canSend) {
      onMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="relative">
      <div className="relative flex gap-2 bg-white drop-shadow-sm border border-neutral-300 rounded-md p-4 focus-within:border-neutral-500 z-20">
        <input
          type="text"
          ref={innerRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSend();
          }}
          disabled={disabled}
          className="flex-1 focus:outline-0 disabled:bg-transparent"
          placeholder={disabled ? "Please wait..." : "Type your message"}
        />
        <button onClick={onSend} disabled={!canSend}>
          <BiSend size={24} color={canSend ? "black" : "#aaa"} />
        </button>
      </div>
      {llmAnimation && (
        <div className="absolute left-4 top-[-48px] z-10">
          <Image src={thinkingImg} alt="thinking" priority width={57} />
        </div>
      )}
    </div>
  );
}
