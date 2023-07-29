import React from "react";
import SessionManager from "@/app/session-manager";

export const dynamic = "force-dynamic";

export default function Home() {
  const interpreterUrl = process.env.INTERPRETER_URL;
  if (interpreterUrl === undefined) {
    throw new Error("INTERPRETER_URL is undefined");
  }
  return <SessionManager interpreterUrl={interpreterUrl} />;
}
