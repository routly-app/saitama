import { Crud } from "@saitamafun/shared";

import type { Webhook } from "./models/webhook.model";

export class WebhookApi extends Crud<Webhook> {
  protected path: string = "webhooks";
}
