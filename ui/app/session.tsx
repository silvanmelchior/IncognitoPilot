import React from "react";
import { Message } from "@/llm/base";
import ChatInput from "@/app/chat_input";
import ChatHistory from "@/app/chat_history";
import InterpreterIO from "@/app/interpreter_io";
import { Interpreter } from "@/app/api_calls";
import { useApprover } from "@/app/approver";
import { ChatRound, ChatRoundState } from "@/app/chat_round";
import { Header } from "@/app/header";
import Brand from "@/app/brand";

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

  const [chatRoundState, setChatRoundState] =
    React.useState<ChatRoundState>("not active");
  const [approverIn, code, askApproveIn, autoApproveIn] = useApprover();
  const [approverOut, result, askApproveOut, autoApproveOut] = useApprover();

  const chatInputRef = React.useRef<HTMLInputElement | null>(null);

  const interpreterRef = React.useRef<Interpreter | null>(null);
  if (interpreterRef.current === null) {
    interpreterRef.current = new Interpreter(interpreterUrl);
  }

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
    <div className="flex h-full bg-blue-50">
      <div className="flex-1 flex flex-col">
        <Header
          error={error}
          onNew={refreshSession}
          showNew={history.length > 0}
        />
        <div className="flex-1 h-0 overflow-y-auto px-8 flex flex-col">
          {history.length === 0 ? <Brand /> : <ChatHistory history={history} />}
        </div>
        <div className="px-16 mt-8 mb-4">
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
      <div className="flex-1 w-0 flex flex-col px-4 bg-blue-100 shadow-[0_0_25px_10px_rgba(0,0,0,0.15)]">
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
