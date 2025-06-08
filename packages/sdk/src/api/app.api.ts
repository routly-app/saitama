import { Crud } from "@saitamafun/shared";
import type { App } from "./models/app.model";

export class AppApi extends Crud<App> {
  path = "apps";
}
