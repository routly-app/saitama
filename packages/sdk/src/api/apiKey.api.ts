import { Crud } from "@saitamafun/shared";

import type { ApiKey } from "./models";

export class ApiKeyApi extends Crud<ApiKey> {
  protected path: string = "apiKeys";
}
