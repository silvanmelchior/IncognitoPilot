'use client'

import React from "react";
import { Message } from "@/llm/base";
import ChatInput from "@/app/chat_input";
import ChatHistory from "@/app/chat_history";
import InterpreterIO from "@/app/interpreter_io";
import { Interpreter } from "@/app/api_calls";
import { useApprover } from "@/app/approver";
import { ChatRound, ChatRoundState } from "@/app/chat_round";


export default function Session() {
  const [history, setHistory] = React.useState<Message[]>([])

  const [error, setError] = React.useState<string | null>(null)

  const [chatRoundState, setChatRoundState] = React.useState<ChatRoundState>("not active")
  const [approverInRef, code, askApproveIn, autoApproveIn] = useApprover()
  const [approverOutRef, result, askApproveOut, autoApproveOut] = useApprover()

  const chatInputRef = React.useRef<HTMLInputElement | null>(null);

  const interpreterRef = React.useRef<Interpreter | null>(null);
  if(interpreterRef.current === null) {
    interpreterRef.current = new Interpreter()
  }

  const focusChatInput = () => {
    setTimeout(() => chatInputRef.current && chatInputRef.current.focus(), 100)
  }
  React.useEffect(focusChatInput, [])

  const startChatRound = (message: string) => {
    const chatRound = new ChatRound(
      history,
      setHistory,
      approverInRef.current,
      approverOutRef.current,
      interpreterRef.current!,
      setChatRoundState,
      setError
    )
    chatRound.trigger(message).then(() => {
      focusChatInput()
    }).catch(() => {
      setError("Could not connect to interpreter")
    })
  }

  return (
    <div className="flex h-full bg-blue-50">
      <div className="flex-1 flex flex-col">
        { error !== null && (
          <div className="flex-0 bg-red-600 text-white font-bold p-4">
            Error: {error}
          </div>
        )}
        <div className="flex-1 h-0 overflow-y-auto px-8">
          <ChatHistory history={history} />
        </div>
        <div className="flex-0 px-8">
          <ChatInput
            innerRef={chatInputRef}
            disabled={chatRoundState !== "not active" || error !== null}
            onMessage={startChatRound}
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
              disabled={error !== null}
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
              disabled={error !== null}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
