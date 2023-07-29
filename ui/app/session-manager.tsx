"use client";

import React from "react";
import Session from "@/app/session";

export default function SessionManager({
  interpreterUrl,
  version,
}: {
  interpreterUrl: string;
  version: string;
}) {
  const [sessionCnt, setSessionCnt] = React.useState(0);
  const refreshSession = () => setSessionCnt(sessionCnt + 1);
  return (
    <Session
      key={sessionCnt}
      refreshSession={refreshSession}
      interpreterUrl={interpreterUrl}
      version={version}
    />
  );
}
