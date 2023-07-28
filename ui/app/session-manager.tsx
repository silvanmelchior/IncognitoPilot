'use client'

import React from "react";
import Session from "@/app/session";


export default function SessionManager() {
  const [sessionCnt, setSessionCnt] = React.useState(0)
  const refreshSession = () => setSessionCnt(sessionCnt + 1)
  return <Session key={sessionCnt} refreshSession={refreshSession} />
}
