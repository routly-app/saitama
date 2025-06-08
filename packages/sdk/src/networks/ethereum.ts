import assert from "assert";
import { erc20Abi } from "viem";
import { getContract, parseEther, type Address, type WalletClient } from "viem";

import { NetworkImpl } from "./impl";
import type { Api, PurePayment } from "..";

export class EthereumPayment extends NetworkImpl {
  constructor(
    private readonly client: WalletClient,
    protected readonly api: Api
  ) {
    super(api);
  }

  readonly initializePayment = async (payment: PurePayment) => {
    assert(
      payment.coin.name === "ethereum",
      "expected payment.wallet.chain to be ethereum"
    );

    const recipient = payment.wallet.address as Address;
    const amount = (() => {
      switch (typeof payment.amount) {
        case "string":
          return parseEther(payment.amount);
        default:
          return BigInt(payment.amount);
      }
    })();

    const chain = this.client.chain;
    const account = this.client.account!;

    let signature: string | undefined;

    if (payment.coin.mint) {
      const contract = getContract({
        abi: erc20Abi,
        // @ts-ignore
        client: this.client,
        address: payment.coin.mint as Address,
      });

      // @ts-ignore
      signature = await contract.write.transfer([recipient, amount], {
        account,
        chain,
      });
    } else {
      // @ts-ignore
      signature = await this.client.sendTransaction({
        to: recipient,
        value: amount,
        account: this.client.account!,
        chain: this.client.chain,
      });
    }

    return this.api.payment.update(payment.id, { signature });
  };
}
