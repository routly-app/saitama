import { ApiImpl } from "@saitamafun/shared";
import type { SendTransaction } from "./models";

export class TransactionApi extends ApiImpl {
  protected path: string = "transactions";

  sendTransaction(data: SendTransaction) {
    return this.xior.post(this.path, data);
  }
}
