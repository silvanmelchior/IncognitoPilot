import React from "react";
import { Approver } from "@/app/approver";


export default function InterpreterIO(
  {
    title,
    content,
    askApprove,
    approver,
    autoApprove
  }: {
    title: string,
    content: string | null,
    askApprove: boolean,
    approver: Approver,
    autoApprove: boolean
  }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-0 text-xl mt-2">{title}</div>
      <div className="flex-1 bg-neutral-50 whitespace-pre overflow-auto h-0 font-mono mt-2 p-2">
        {content}
      </div>
      <div className="flex-0 flex justify-end items-center my-2">
        <div className="flex-0">
          <input
            className="align-middle accent-red-600"
            type="checkbox"
            checked={autoApprove}
            onChange={e => approver.setAutoApprove(e.target.checked)}
          />{' '}
          auto-approve
        </div>
        <div className="flex-0 ml-4">
          <button
            className="px-4 py-2 bg-red-600 disabled:bg-gray-100 text-white disabled:text-gray-300 rounded-md"
            onClick={approver.approve}
            disabled={!askApprove}
          >Approve</button>
        </div>
      </div>
    </div>
  )
}
