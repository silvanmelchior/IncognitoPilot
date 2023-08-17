import React from "react";

export class Approver {
  private resolveHandler: ((result: boolean) => void) | null = null;

  constructor(
    private autoApprove: boolean,
    private readonly _setAutoApprove: (autoApprove: boolean) => void,
    private readonly setAskApprove: (askApprove: boolean) => void,
  ) {}

  setAutoApprove = (autoApprove: boolean) => {
    this.autoApprove = autoApprove;
    this._setAutoApprove(autoApprove);
    this.approve(true);
  };

  approve = (approval: boolean) => {
    if (this.resolveHandler !== null) {
      this.setAskApprove(false);
      this.resolveHandler(approval);
      this.resolveHandler = null;
    }
  };

  getApproval = () => {
    return new Promise<boolean>((resolve, reject) => {
      if (this.autoApprove) {
        resolve(true);
      } else {
        this.resolveHandler = resolve;
        this.setAskApprove(true);
      }
    });
  };
}

export function useApprover(): [Approver, boolean, boolean] {
  const [askApprove, setAskApprove] = React.useState<boolean>(false);
  const [autoApprove, setAutoApprove] = React.useState<boolean>(false);
  const approverRef = React.useRef(
    new Approver(autoApprove, setAutoApprove, setAskApprove),
  );
  return [approverRef.current, askApprove, autoApprove];
}
