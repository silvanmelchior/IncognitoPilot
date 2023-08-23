"use client";

import React from "react";
import axios from "axios";
import { SERVICES_URL } from "@/app/services";

export default function Authentication({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    let token = urlParams.get("token");
    if (token !== null) {
      localStorage.setItem("auth_token", token);
    } else {
      token = localStorage.getItem("auth_token");
    }

    if (token !== null) {
      axios
        .post(SERVICES_URL + "/api/auth/verify", {
          token,
        })
        .then((response) => {
          console.log("SUCCESS", token); // TODO: REMOVE
          setToken(token);
        })
        .catch((error) => {
          console.log("ERROR");
        }); // will show error later (TODO: REMOVE CONSOLE LOGS)
    }
  }, []);

  return children;
}
