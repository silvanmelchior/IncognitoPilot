'use client'

import React from "react";
import { Message } from "@/llm/base";
import ChatInput from "@/app/chat_input";
import axios from "axios";
import ChatHistory from "@/app/chat_history";


async function chatCall(messages: Message[]): Promise<Message> {
  const response = await axios.post("/api/chat", messages)
  return response.data
}


export default function Session() {
  const [history, setHistory] = React.useState<Message[]>([])
  const [chatInputDisabled, setChatInputDisabled] = React.useState<boolean>(false)
  const chatInputRef = React.useRef<HTMLInputElement | null>(null);

  const readyForUserMessage = () => {
    setChatInputDisabled(false);
    setTimeout(() => chatInputRef.current && chatInputRef.current.focus(), 10)
  }

  const onUserMessage = (history: Message[]) => (message: string) => {
    setChatInputDisabled(true)
    const newMessage: Message = { role: "user", text: message }
    const newHistory = [...history, newMessage]
    setHistory(newHistory)
    chatCall(newHistory).then(onModelMessage(newHistory))
  }

  const onModelMessage = (history: Message[]) => (message: Message) => {
    const newHistory = [...history, message]
    setHistory(newHistory)
    readyForUserMessage()
  }

  return (
    <div>
      <ChatHistory history={history} />
      <ChatInput
        innerRef={chatInputRef}
        disabled={chatInputDisabled}
        onMessage={onUserMessage(history)}
      />
    </div>
  )
}
