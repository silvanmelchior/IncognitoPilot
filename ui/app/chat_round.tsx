import { Message } from "@/llm/base";
import { chatCall, Interpreter } from "@/app/api_calls";
import { Approver } from "@/app/approver";


export type ChatRoundState = "not active" | "waiting for model" |
  "waiting for interpreter" | "waiting for approval"

export class ChatRound {
  constructor(
    private _history: Message[],
    private readonly _setHistory: (message: Message[]) => void,
    private readonly _approverIn: Approver,
    private readonly _approverOut: Approver,
    private readonly _interpreter: Interpreter,
    private readonly _setState: (state: ChatRoundState) => void,
    private readonly _doneCallback: () => void
  ) {}

  private extendHistory(message: Message) {
    const newHistory = [...this._history, message]
    this._setHistory(newHistory)
    this._history = newHistory
    return newHistory
  }

  start = (message: string) => {
    const newMessage: Message = { role: "user", text: message }
    const newHistory = this.extendHistory(newMessage)
    this._setState("waiting for model")
    chatCall(newHistory).then(this.onModelMessage)
  }

  private onModelMessage = (message: Message) => {
    this.extendHistory(message)
    if(message.code !== undefined) {
      this._setState("waiting for approval")
      this._approverIn.getApproval(message.code).then(() => {
        this.executeCode(message.code!)
      })
    }
    else {
      this._setState("not active")
      this._doneCallback()
    }
  }

  private executeCode = (code: string) => {
    this._setState("waiting for interpreter")
    this._interpreter.run(code).then(result => {
      this._setState("waiting for approval")
      const tmpAutoApprove = result === ""
      const resultText = tmpAutoApprove ?
        "(empty output was automatically approved)" : result
      this._approverOut.getApproval(resultText, tmpAutoApprove).then(() => {
        this.executeCodeDone(result)
      })
    })
  }

  private executeCodeDone = (result: string) => {
    const newMessage: Message = { role: "interpreter", code_result: result }
    const newHistory = this.extendHistory(newMessage)
    this._setState("waiting for model")
    chatCall(newHistory).then(this.onModelMessage)
  }

}
