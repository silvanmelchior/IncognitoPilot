'use client'

import React from "react";
import { Message } from "@/llm/base";
import ChatInput from "@/app/chat_input";
import ChatHistory from "@/app/chat_history";
import InterpreterIO from "@/app/interpreter_io";
import { chatCall, Interpreter } from "@/app/api_calls";
import { useApprover } from "@/app/approver";


export default function Session() {
  const [history, setHistory] = React.useState<Message[]>([])
  const [chatInputDisabled, setChatInputDisabled] = React.useState<boolean>(false)
  const chatInputRef = React.useRef<HTMLInputElement | null>(null);

  const [code, setCode] = React.useState<string | null>(null)
  const [approverInRef, askApproveIn, autoApproveIn] = useApprover()

  const [result, setResult] = React.useState<string | null>(null)
  const [approverOutRef, askApproveOut, autoApproveOut] = useApprover()

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
      approverInRef.current.whenApproved().then(() => {
        executeCode(newHistory)(message.code)
      })
    }
    else {
      readyForUserMessage()
    }
  }

  const executeCode = (history: Message[]) => (code: string) => {
    interpreterRef.current?.run(code).then(result => {
      setResult(result)
      approverOutRef.current.whenApproved().then(() => {
        executeCodeDone(history)(result)
      })
    })
  }

  const executeCodeDone = (history: Message[]) => (result: string) => {
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
              autoApprove={autoApproveIn}
              approver={approverInRef.current}
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col h-0">
          <div className="flex-1 h-0">
            <InterpreterIO
              title="Result"
              content={result}
              askApprove={askApproveOut}
              autoApprove={autoApproveOut}
              approver={approverOutRef.current}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
