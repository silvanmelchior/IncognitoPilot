import React from "react";

export default function Running() {
  const [state, setState] = React.useState(0);

  React.useEffect(() => {
    const updateState = (state: number) => (state >= 4 ? 0 : state + 1);
    const interval = setInterval(() => setState(updateState), 200);
    return () => clearInterval(interval);
  }, []);

  if (state === 0) return "Running...";
  if (state === 1) return "Running";
  if (state === 2) return "Running.";
  if (state === 3) return "Running..";
  if (state === 4) return "Running...";
}
