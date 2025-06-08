import { useMemo } from "react";
import { Api } from "@saitamafun/sdk";

import { APIContext } from "../contexts/APIContext";

type APIProviderProps = {
  appId: string;
  apiKey: string;
  baseURL: string;
};

export default function APIProvider({
  baseURL,
  apiKey,
  appId,
  children,
}: React.PropsWithChildren<APIProviderProps>) {
  const api = useMemo(
    () => new Api(baseURL, apiKey, appId),
    [apiKey, appId, baseURL]
  );

  return <APIContext.Provider value={{ api }}>{children}</APIContext.Provider>;
}


