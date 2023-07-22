import React from "react";

export class Approver {
  private readonly _setContent: (content: string) => void
  private _autoApprove: boolean
  private readonly _setAutoApprove: (autoApprove: boolean) => void
  private readonly _setAskApprove: (autoApprove: boolean) => void
  private _resolveHandler: (value: void) => void | null

  constructor(
    setContent: (content: string) => void,
    autoApprove: boolean,
    setAutoApprove: (autoApprove: boolean) => void,
    setAskApprove: (askApprove: boolean) => void
  ) {
    this._setContent = setContent
    this._autoApprove = autoApprove
    this._setAutoApprove = setAutoApprove
    this._setAskApprove = setAskApprove
    this._resolveHandler = null
  }

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

  whenApproved = (content: string) => {
    this._setContent(content)
    return new Promise<void>((resolve, reject) => {
      if(this._autoApprove) {
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
