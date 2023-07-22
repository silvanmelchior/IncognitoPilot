import React from "react";

export class Approver {
  private _resolveHandler: (value: void) => void | null = null

  constructor(
    private readonly _setContent: (content: string) => void,
    private _autoApprove: boolean,
    private readonly _setAutoApprove: (autoApprove: boolean) => void,
    private readonly _setAskApprove: (askApprove: boolean) => void
  ) {}

  setAutoApprove = (autoApprove: boolean) => {
    this._autoApprove = autoApprove
    this._setAutoApprove(autoApprove)
    if(this._resolveHandler !== null) {
      this.approve()
    }
  }

  approve = () => {
    if(this._resolveHandler !== null) {
      this._setAskApprove(false)
      this._resolveHandler()
      this._resolveHandler = null
    }
  }

  getApproval = (content: string, tmpAutoApprove: boolean = false) => {
    this._setContent(content)
    return new Promise<void>((resolve, reject) => {
      if(this._autoApprove || tmpAutoApprove) {
        resolve()
      } else {
        this._resolveHandler = resolve
        this._setAskApprove(true)
      }
    })
  }

}

export function useApprover() {
  const [content, setContent] = React.useState<string | null>(null)
  const [askApprove, setAskApprove] = React.useState<boolean>(false)
  const [autoApprove, setAutoApprove] = React.useState<boolean>(false)
  const approverRef = React.useRef(new Approver(
    setContent, autoApprove, setAutoApprove, setAskApprove))
  return [approverRef, content, askApprove, autoApprove]
}
