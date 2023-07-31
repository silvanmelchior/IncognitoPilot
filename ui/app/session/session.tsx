import React from "react";
import { Message } from "@/llm/base";
import ChatInput from "@/app/session/chat/chat_input";
import ChatHistory from "@/app/session/chat/chat_history";
import InterpreterIO from "@/app/session/approval/interpreter_io";
import { Interpreter } from "@/app/session/communication/api_calls";
import { useApprover } from "@/app/session/approval/approver";
import {
  ChatRound,
  ChatRoundState,
} from "@/app/session/communication/chat_round";
import { Header } from "@/app/session/chat/header";
import Brand from "@/app/session/chat/brand";

export default function Session({
  interpreterUrl,
  refreshSession,
  version,
}: {
  interpreterUrl: string;
  refreshSession: () => void;
  version: string;
}) {
  const [history, setHistory] = React.useState<Message[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [showIO, setShowIO] = React.useState<boolean>(false);

  const [chatRoundState, setChatRoundState] =
    React.useState<ChatRoundState>("not active");
  const [approverIn, code, askApproveIn, autoApproveIn] = useApprover();
  const [approverOut, result, askApproveOut, autoApproveOut] = useApprover();

  const chatInputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const interpreterRef = React.useRef<Interpreter | null>(null);
  if (interpreterRef.current === null) {
    interpreterRef.current = new Interpreter(interpreterUrl);
  }

  React.useEffect(() => {
    if (chatRoundState === "waiting for approval") {
      setShowIO(true);
    }
  }, [chatRoundState]);

  const focusChatInput = () => {
    setTimeout(() => chatInputRef.current && chatInputRef.current.focus(), 100);
  };
  React.useEffect(focusChatInput, []);

  const startChatRound = (message: string) => {
    const chatRound = new ChatRound(
      history,
      setHistory,
      approverIn,
      approverOut,
      interpreterRef.current!,
      setChatRoundState,
    );
    chatRound
      .run(message)
      .then(focusChatInput)
      .catch((e) => {
        setError(e.message);
      });
  };

  return (
    <div className="relative h-full bg-blue-50 overflow-x-hidden">
      <div
        className={`absolute top-0 left-0 h-full flex flex-col items-center transition-all duration-500 ${
          showIO ? "w-1/2" : "w-[calc(100%-100px)]"
        }`}
      >
        <Header
          error={error}
          onNew={refreshSession}
          showNew={history.length > 0}
        />
        <div className="flex-1 h-0 overflow-y-auto px-8 flex flex-col w-full max-w-6xl">
          {history.length === 0 ? <Brand /> : <ChatHistory history={history} />}
        </div>
        <div className="px-16 mt-8 mb-4 w-full max-w-4xl">
          <ChatInput
            innerRef={chatInputRef}
            disabled={chatRoundState !== "not active" || error !== null}
            llmAnimation={chatRoundState === "waiting for model"}
            onMessage={startChatRound}
          />
        </div>
        <div className="text-blue-200 text-center text-xs pb-4">
          Version {version}
        </div>
      </div>
      <div
        className={`absolute top-0 right-0 w-1/2 h-full flex flex-col px-4 bg-blue-100 shadow-[0_0_25px_10px_rgba(0,0,0,0.15)] transition-all duration-500 ${
          showIO
            ? ""
            : "translate-x-[calc(100%-100px)] opacity-50 hover:transition-none hover:opacity-100 cursor-pointer"
        }`}
        onClick={() => setShowIO(true)}
      >
        <div className="flex-1 flex flex-col h-0">
          <div className="flex-1 h-0">
            <InterpreterIO
              title="Code"
              content={code}
              askApprove={askApproveIn}
              autoApprove={autoApproveIn}
              approver={approverIn}
              disabled={error !== null}
              busy={false}
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
              approver={approverOut}
              disabled={error !== null}
              busy={chatRoundState === "waiting for interpreter"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
