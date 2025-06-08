import type { XiorResponse } from "xior";
import type { Api, Payment, PurePayment } from "../api";

export abstract class NetworkImpl {
  constructor(protected readonly api: Api) {}

  abstract initializePayment(
    payment: PurePayment
  ): Promise<Payment | XiorResponse<Payment>>;
}
