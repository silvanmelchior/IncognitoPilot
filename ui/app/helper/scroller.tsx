import React from "react";

class Throttler {
  private actionQueued = false;
  constructor(private actionHandler: () => void) {}

  actionRun = () => {
    this.actionQueued = false;
    this.actionHandler();
  };

  action = () => {
    if (!this.actionQueued) {
      this.actionQueued = true;
      setTimeout(() => this.actionRun(), 200);
    }
  };
}

export default function useScroller(state: any) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const throttler = React.useRef<Throttler>(
    new Throttler(() => {
      const div = scrollRef.current;
      if (div !== null) {
        div.scrollTo({ top: div.scrollHeight, behavior: "smooth" });
      }
    }),
  );

  React.useEffect(() => throttler.current.action(), [state]);

  return scrollRef;
}
