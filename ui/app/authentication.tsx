"use client";

import React, { createContext } from "react";
import axios from "axios";
import { SERVICES_URL } from "@/app/services";

export const AuthContext = createContext<string | null>(null);

export const AUTH_ERROR_MSG =
  "Could not authenticate to backend. This probably means there is no or an invalid authentication token provided in the URL. Please check the startup console output of the backend and add a valid token to the URL.";

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
      window.location.hash = "";
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
          setToken(token);
        })
        .catch((error) => {}); // will show error later
    }
  }, []);

  return <AuthContext.Provider value={token}>{children}</AuthContext.Provider>;
}
