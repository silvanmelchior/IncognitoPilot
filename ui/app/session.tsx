'use client'

import React from "react";
import { Message } from "@/llm/base";
import ChatInput from "@/app/chat_input";
import ChatHistory from "@/app/chat_history";
import InterpreterIO from "@/app/interpreter_io";
import { chatCall, Interpreter } from "@/app/api_calls";


export default function Session() {
  const [history, setHistory] = React.useState<Message[]>([])
  const [chatInputDisabled, setChatInputDisabled] = React.useState<boolean>(false)
  const chatInputRef = React.useRef<HTMLInputElement | null>(null);

  const [code, setCode] = React.useState<string | null>(null)
  const [askApproveIn, setAskApproveIn] = React.useState<boolean>(false)
  const [autoApproveIn, setAutoApproveIn] = React.useState<boolean>(false)

  const [result, setResult] = React.useState<string | null>(null)
  const [askApproveOut, setAskApproveOut] = React.useState<boolean>(false)
  const [autoApproveOut, setAutoApproveOut] = React.useState<boolean>(false)

  const interpreterRef = React.useRef<Interpreter | null>(null);
  if(interpreterRef.current === null) {
    interpreterRef.current = new Interpreter()
  }

  const focusChatInput = () => {
    setTimeout(() => chatInputRef.current && chatInputRef.current.focus(), 100)
  }
  React.useEffect(focusChatInput, [])

  const readyForUserMessage = () => {
    setChatInputDisabled(false)
    focusChatInput()
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
        executeCode(newHistory)(message.code)
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
    interpreterRef.current?.run(code).then(result => {
      setResult(result)
      if(autoApproveOut) {
        executeCodeDone(history)(result)
      }
      else {
        setAskApproveOut(true)
      }
    })
  }

  const executeCodeDone = (history: Message[]) => (result: string) => {
    setAskApproveOut(false)
    const newMessage: Message = { role: "interpreter", code_result: result }
    const newHistory = [...history, newMessage]
    setHistory(newHistory)
    chatCall(newHistory).then(onModelMessage(newHistory))
  }

  return (
    <div className="flex gap-4 h-full bg-blue-50">
      <div className="flex-1 flex flex-col px-4">
        <div className="flex-1 h-0 overflow-y-auto">
          <ChatHistory history={history} />
        </div>
        <div className="flex-0">
          <ChatInput
            innerRef={chatInputRef}
            disabled={chatInputDisabled}
            onMessage={onUserMessage(history)}
          />
        </div>
      </div>
      <div className="flex-1 w-0 flex flex-col px-4 bg-blue-100 shadow-[0_0_25px_10px_rgba(0,0,0,0.15)]">
        <div className="flex-1 flex flex-col h-0">
          <div className="flex-1 h-0">
            <InterpreterIO
              title="Code"
              content={code}
              askApprove={askApproveIn}
              onApprove={() => {executeCode(history)(code)}}
              autoApprove={autoApproveIn}
              setAutoApprove={setAutoApproveIn}
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col h-0">
          <div className="flex-1 h-0">
            <InterpreterIO
              title="Result"
              content={result}
              askApprove={askApproveOut}
              onApprove={() => {executeCodeDone(history)(result)}}
              autoApprove={autoApproveOut}
              setAutoApprove={setAutoApproveOut}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
