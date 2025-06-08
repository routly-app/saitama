import xior, { type XiorInstance } from "xior";

import { AppApi } from "./app.api";
import { CoinApi } from "./coin.api";
import { WalletApi } from "./wallet.api";
import { ApiKeyApi } from "./apiKey.api";
import { WebhookApi } from "./webhook.api";
import { PaymentApi } from "./payment.api";
import { CustomerApi } from "./customer.api";
import { NetworkApi } from "./network.api";
import { PaymentLinkApi } from "./paymentLink.api";
import { TransactionApi } from "./transaction.api";

export type * from "./models";

export class Api {
  private readonly xior: XiorInstance;

  readonly app: AppApi;
  readonly coin: CoinApi;
  readonly apiKey: ApiKeyApi;
  readonly wallet: WalletApi;
  readonly payment: PaymentApi;
  readonly webhook: WebhookApi;
  readonly network: NetworkApi;
  readonly customer: CustomerApi;
  readonly paymentLink: PaymentLinkApi;
  readonly transaction: TransactionApi;

  constructor(
    private readonly endpoint: string,
    private readonly accessToken: string,
    private readonly appId?: string
  ) {
    const headers: { Authorization?: string; "x-app-id"?: string } = {
      Authorization: "Bearer " + this.accessToken,
    };

    if (this.appId) headers["x-app-id"] = this.appId;

    this.xior = xior.create({
      baseURL: this.endpoint,
      headers,
    });

    this.app = new AppApi(this.xior);
    this.coin = new CoinApi(this.xior);
    this.apiKey = new ApiKeyApi(this.xior);
    this.wallet = new WalletApi(this.xior);
    this.webhook = new WebhookApi(this.xior);
    this.payment = new PaymentApi(this.xior);
    this.network = new NetworkApi(this.xior);
    this.customer = new CustomerApi(this.xior);
    this.paymentLink = new PaymentLinkApi(this.xior);
    this.transaction = new TransactionApi(this.xior);
  }
}

export default Api;
