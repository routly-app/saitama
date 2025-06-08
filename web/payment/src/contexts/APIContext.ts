import type { Api } from "@saitamafun/sdk";
import { createContext, useContext } from "react";

type APIContext = {
  api: InstanceType<typeof Api>;
};

export const APIContext = createContext<Partial<APIContext>>({
  api: undefined,
});

export const useAPI = () => useContext(APIContext) as APIContext;
