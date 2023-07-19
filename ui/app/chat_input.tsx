import React from "react";

export default function ChatInput(
  {
    innerRef,
    disabled,
    onMessage
  }: {
    innerRef: React.MutableRefObject<HTMLInputElement | null>,
    disabled: boolean
    onMessage: (message: string) => void
  }) {
  const [message, setMessage] = React.useState<string>("")
  const onSend = () => {
    onMessage(message);
    setMessage("");
  }

  return (
    <div>
      <input
        type="text"
        ref={innerRef}
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={event => {
          if (event.key === "Enter") onSend()
        }}
        disabled={disabled}
        style={{ backgroundColor: "#ccc" }}
      />
      <button onClick={onSend} disabled={disabled}>Send</button>
    </div>
  )
}
