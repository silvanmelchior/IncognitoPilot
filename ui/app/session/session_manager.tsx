"use client";

import React from "react";
import Session from "@/app/session/session";

export default function SessionManager({
  interpreterUrl,
  llmUrl,
  version,
}: {
  interpreterUrl: string;
  llmUrl: string;
  version: string;
}) {
  const [sessionCnt, setSessionCnt] = React.useState(0);
  const refreshSession = () => setSessionCnt(sessionCnt + 1);
  return (
    <Session
      key={sessionCnt}
      refreshSession={refreshSession}
      interpreterUrl={interpreterUrl}
      llmUrl={llmUrl}
      version={version}
    />
  );
}
