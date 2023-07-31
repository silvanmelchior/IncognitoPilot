import React from "react";

export default function Running() {
  const [state, setState] = React.useState(0);
  const stateRef = React.useRef(state);
  React.useEffect(() => {
    const interval = setInterval(() => {
      stateRef.current++;
      if (stateRef.current > 4) stateRef.current = 0;
      setState(stateRef.current);
    }, 200);
    return () => clearInterval(interval);
  });
  if (state === 0) return "Running...";
  if (state === 1) return "Running";
  if (state === 2) return "Running.";
  if (state === 3) return "Running..";
  if (state === 4) return "Running...";
}
