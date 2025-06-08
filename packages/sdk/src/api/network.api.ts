import { Crud } from "@saitamafun/shared";

import type { Network } from "./models";

export class NetworkApi extends Crud<Network> {
  protected path: string = "networks";
}
