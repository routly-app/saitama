"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import APIProvider from "./APIProvider";
import DexScreenerProvider from "./DexscreenerProvider";
import StoreProvider, { StoreIntialState } from "./StoreProvider";

const client = new QueryClient();

type ProviderProps = {} & React.ComponentProps<typeof StoreIntialState> &
  React.ComponentProps<typeof APIProvider>;

export default function Provider({
  children,
  apiKey,
  appId,
  baseURL,
  payment,
  paymentLink,
  networks,
}: React.PropsWithChildren<ProviderProps>) {
  return (
    <QueryClientProvider client={client}>
      <StoreProvider>
        <APIProvider
          appId={appId}
          apiKey={apiKey}
          baseURL={baseURL}
        >
          <StoreIntialState
            payment={payment}
            networks={networks}
            paymentLink={paymentLink}
          >
            <DexScreenerProvider>{children}</DexScreenerProvider>
          </StoreIntialState>
        </APIProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}
