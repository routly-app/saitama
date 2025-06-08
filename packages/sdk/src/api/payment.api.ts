import { Crud } from "@saitamafun/shared";

import type { Payment } from "./models/payment.model";

export class PaymentApi extends Crud<Payment> {
  path = "payments";

  verify(id: string) {
    return this.xior.get<Payment>(this.buildPath(id, "verify"));
  }
}
