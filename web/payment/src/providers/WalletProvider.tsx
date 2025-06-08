import { useMemo } from "react";
import type { App } from "@saitamafun/sdk";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider as TronWalletProvider } from "@tronweb3/tronwallet-adapter-react-hooks";

import { mainnet } from "wagmi/chains";
import { WagmiProvider, createConfig, http } from "wagmi";

import { web3 } from "@coral-xyz/anchor";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";

const client = new QueryClient();

type ProviderProps = {
  app: App;
  walletConnectProjectId: string;
  solanaConfig?: {
    network: WalletAdapterNetwork;
  };
};

export default function Provider({
  children,
  app,
  walletConnectProjectId,
  solanaConfig,
}: React.PropsWithChildren<ProviderProps>) {
  const config = useMemo(
    () =>
      createConfig(
        getDefaultConfig({
          appName: app.name,
          appIcon: app.logo,
          appUrl: window.location.host,
          walletConnectProjectId,
          chains: [mainnet],
          transports: {
            [mainnet.id]: http(""),
          },
        })
      ),
    [app, walletConnectProjectId]
  );

  const endpoint = useMemo(
    () => web3.clusterApiUrl(solanaConfig?.network),
    [solanaConfig]
  );

  const solanaWallets = useMemo(() => [], []);
  const tronWallets = useMemo(() => [], []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <ConnectKitProvider>
          <TronWalletProvider adapters={tronWallets}>
            <ConnectionProvider endpoint={endpoint}>
              <SolanaWalletProvider wallets={solanaWallets}>
                <WalletModalProvider>{children}</WalletModalProvider>
              </SolanaWalletProvider>
            </ConnectionProvider>
          </TronWalletProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
