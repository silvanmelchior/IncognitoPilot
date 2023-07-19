'use client'  // TODO

import axios from "axios";
import React from "react"
import { Message } from "@/llm/base";

async function chatCall(messages: Message[]): Promise<Message> {
  const response = await axios.post("/api/chat", messages)
  return response.data
}

export default function Home() {
  React.useEffect(() => {
    console.log('run fn')
    chatCall([
      {role: "user", text: "Hi, how are you?"},
    ]).then((msg) => console.log(msg))
  }, [])

  return (
    <div>
      Hello World
    </div>
  )
}
