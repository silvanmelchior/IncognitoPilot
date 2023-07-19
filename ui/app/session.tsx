'use client'

import React from "react";
import { Message } from "@/llm/base";
import ChatInput from "@/app/chat_input";
import ChatHistory from "@/app/chat_history";
import InterpreterInput from "@/app/interpreter_in";
import InterpreterOutput from "@/app/interpreter_out";
import { chatCall, codeCall, CodeResult } from "@/app/api_calls";


export default function Session() {
  const [history, setHistory] = React.useState<Message[]>([])
  const [chatInputDisabled, setChatInputDisabled] = React.useState<boolean>(false)
  const chatInputRef = React.useRef<HTMLInputElement | null>(null);

  const [code, setCode] = React.useState<string | null>(null)
  const [askApproveIn, setAskApproveIn] = React.useState<boolean>(false)
  const [autoApproveIn, setAutoApproveIn] = React.useState<boolean>(false)

  const [result, setResult] = React.useState<CodeResult | null>(null)
  const [askApproveOut, setAskApproveOut] = React.useState<boolean>(false)
  const [autoApproveOut, setAutoApproveOut] = React.useState<boolean>(false)

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
    if(message.code !== undefined) {
      setCode(message.code)
      if(autoApproveIn) {
        executeCode(history)(message.code)
      }
      else {
        setAskApproveIn(true)
      }
    }
    else {
      readyForUserMessage()
    }
  }

  const executeCode = (history: Message[]) => (code: string) => {
    setAskApproveIn(false)
    codeCall(code).then(result => {
      setResult(result)
      if(autoApproveOut) {
        executeCodeDone(history)(result)
      }
      else {
        setAskApproveOut(true)
      }
    })
  }

  const executeCodeDone = (history: Message[]) => (result: CodeResult) => {
    const newMessage: Message = { role: "interpreter", code_result: result }
    const newHistory = [...history, newMessage]
    setHistory(newHistory)
    chatCall(newHistory).then(onModelMessage(newHistory))
  }

  return (
    <div>
      <ChatHistory history={history} />
      <ChatInput
        innerRef={chatInputRef}
        disabled={chatInputDisabled}
        onMessage={onUserMessage(history)}
      />
      <InterpreterInput
        code={code}
        askApprove={askApproveIn}
        onApprove={() => {executeCode(history)(code)}}
        autoApprove={autoApproveIn}
        setAutoApprove={setAutoApproveIn}
      />
      <InterpreterOutput
        result={result}
        askApprove={askApproveOut}
        onApprove={() => {executeCodeDone(history)(result)}}
        autoApprove={autoApproveOut}
        setAutoApprove={setAutoApproveOut}
      />
    </div>
  )
}
