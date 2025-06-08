import assert from "assert";
import { type TronWeb } from "tronweb";
import type { Address } from "viem";

import { NetworkImpl } from "./impl";
import TRX20 from "../abi/TRX20.json";
import type { Api, PurePayment } from "../api";

export class TronPayment extends NetworkImpl {
  constructor(private readonly tronWeb: TronWeb, protected readonly api: Api) {
    super(api);
  }

  readonly initializePayment = async (payment: PurePayment) => {
    assert(
      payment.coin.name === "tron",
      "expected payment.wallet.chain to be tron"
    );

    const amount = payment.amount;
    const recipient = payment.wallet.address;

    let signature: string | undefined;

    if (payment.coin.mint) {
      const contract = await this.tronWeb
        .contract(TRX20)
        .at(payment.coin.mint as Address);
      signature = await contract.methods
        .transfer(recipient, Number(amount))
        .send();
    } else {
      const tx = await this.tronWeb.trx.sendTransaction(
        recipient,
        Number(amount)
      );
      signature = tx.txid;
    }

    return this.api.payment.update(payment.id, { signature });
  };
}
