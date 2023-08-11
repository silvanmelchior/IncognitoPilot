import React from "react";
import SessionManager from "@/app/session/session_manager";
import path from "path";
import * as fs from "fs";

export const dynamic = "force-dynamic";

function getInterpreterUrl() {
  const interpreterUrl = process.env.INTERPRETER_URL;
  if (interpreterUrl === undefined) {
    throw new Error("INTERPRETER_URL is undefined");
  }
  return interpreterUrl;
}

function getLlmUrl() {
  const llmUrl = process.env.LLM_URL;
  if (llmUrl === undefined) {
    throw new Error("LLM_URL is undefined");
  }
  return llmUrl;
}

function getVersion(): Promise<string> {
  const versionDir = path.dirname(
    path.dirname(path.dirname(path.dirname(__dirname))),
  );
  const versionPath = path.join(versionDir, "VERSION");
  return new Promise((resolve, reject) => {
    fs.readFile(versionPath, "utf8", (err, data) => {
      if (err) {
        resolve("unknown");
      } else {
        resolve(data.trim());
      }
    });
  });
}

export default async function Home() {
  return (
    <SessionManager
      interpreterUrl={getInterpreterUrl()}
      llmUrl={getLlmUrl()}
      version={await getVersion()}
    />
  );
}
