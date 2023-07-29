import React from "react";
import { BiSend } from "react-icons/bi";

export default function ChatInput({
  innerRef,
  disabled,
  onMessage,
}: {
  innerRef: React.MutableRefObject<HTMLInputElement | null>;
  disabled: boolean;
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
    <div className="flex gap-2 bg-white drop-shadow-sm border border-neutral-300 rounded-md p-4 focus-within:border-neutral-500">
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
  );
}
