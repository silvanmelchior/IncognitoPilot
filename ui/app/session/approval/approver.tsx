import React from "react";

export class Approver {
  private resolveHandler: ((value: void) => void) | null = null;

  constructor(
    private readonly setContent: (content: string) => void,
    private autoApprove: boolean,
    private readonly _setAutoApprove: (autoApprove: boolean) => void,
    private readonly setAskApprove: (askApprove: boolean) => void,
  ) {}

  setAutoApprove = (autoApprove: boolean) => {
    this.autoApprove = autoApprove;
    this._setAutoApprove(autoApprove);
    if (this.resolveHandler !== null) {
      this.approve();
    }
  };

  approve = () => {
    if (this.resolveHandler !== null) {
      this.setAskApprove(false);
      this.resolveHandler();
      this.resolveHandler = null;
    }
  };

  getApproval = (content: string, tmpAutoApprove: boolean = false) => {
    this.setContent(content);
    return new Promise<void>((resolve, reject) => {
      if (this.autoApprove || tmpAutoApprove) {
        resolve();
      } else {
        this.resolveHandler = resolve;
        this.setAskApprove(true);
      }
    });
  };
}

export function useApprover(): [Approver, string | null, boolean, boolean] {
  const [content, setContent] = React.useState<string | null>(null);
  const [askApprove, setAskApprove] = React.useState<boolean>(false);
  const [autoApprove, setAutoApprove] = React.useState<boolean>(false);
  const approverRef = React.useRef(
    new Approver(setContent, autoApprove, setAutoApprove, setAskApprove),
  );
  return [approverRef.current, content, askApprove, autoApprove];
}
