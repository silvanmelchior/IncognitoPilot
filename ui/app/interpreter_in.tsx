export default function InterpreterInput(
  {
    code,
    askApprove,
    autoApprove,
    setAutoApprove,
    onApprove
  }: {
    code: string | null,
    askApprove: boolean,
    onApprove: () => void
    autoApprove: boolean,
    setAutoApprove: (autoApprove: boolean) => void,
  }) {
  return (
    <div>
      <textarea value={code ?? ""} readOnly /><br/>
      <button onClick={onApprove} disabled={!askApprove}>Approve</button>
      <input
        type="checkbox"
        checked={autoApprove}
        onChange={e => setAutoApprove(e.target.checked)}
      /> auto-approve
    </div>
  )
}
