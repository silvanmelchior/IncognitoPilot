import React from "react";
import SessionManager from "@/app/session-manager";
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
  const interpreterUrl = getInterpreterUrl();
  const version = await getVersion();
  return <SessionManager interpreterUrl={interpreterUrl} version={version} />;
}
