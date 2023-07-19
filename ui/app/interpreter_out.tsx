import { CodeResult } from "@/app/api_calls";

export default function InterpreterOutput(
  {
    result,
    askApprove,
    autoApprove,
    setAutoApprove,
    onApprove
  }: {
    result: CodeResult | null,
    askApprove: boolean,
    onApprove: () => void
    autoApprove: boolean,
    setAutoApprove: (autoApprove: boolean) => void,
  }) {
  return (
    <div>
      <textarea value={(result?.stdout ?? "") + (result?.stderr ?? "")} readOnly /><br/>
      <button onClick={onApprove} disabled={!askApprove}>Approve</button>
      <input
        type="checkbox"
        checked={autoApprove}
        onChange={e => setAutoApprove(e.target.checked)}
      /> auto-approve
    </div>
  )
}
