import React from "react";
import { Approver } from "@/app/session/approval/approver";
import Running from "@/app/session/approval/running";

export default function InterpreterIO({
  title,
  content,
  askApprove,
  approver,
  autoApprove,
  disabled,
  busy,
}: {
  title: string;
  content: string | null;
  askApprove: boolean;
  approver: Approver;
  autoApprove: boolean;
  disabled: boolean;
  busy: boolean;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="text-xl mt-2 text-blue-400">{title}</div>
      <div
        className={`flex-1 ${
          busy ? "bg-neutral-100" : "bg-neutral-50"
        } whitespace-pre overflow-auto h-0 font-mono mt-2 p-2 ${
          askApprove ? "border-red-400" : "border-transparent"
        } border-2`}
      >
        {busy ? <Running /> : content}
      </div>
      <div className="flex justify-end items-center my-2">
        <div>
          <input
            className="align-middle accent-red-600"
            type="checkbox"
            checked={autoApprove}
            onChange={(e) => approver.setAutoApprove(e.target.checked)}
            disabled={disabled}
          />{" "}
          auto-approve
        </div>
        <div className="ml-4">
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-100 text-white disabled:text-gray-300 rounded-md"
            onClick={approver.approve}
            disabled={!askApprove || disabled}
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
