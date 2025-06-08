import { Crud } from "@saitamafun/shared";

import type { PaymentLink } from "./models";

export class PaymentLinkApi extends Crud<PaymentLink> {
  protected path: string = "payment-links";
}
