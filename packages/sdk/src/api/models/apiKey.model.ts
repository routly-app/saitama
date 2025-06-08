import type { App } from "./app.model";

export type ApiKey = {
  id: string;
  app: App | string;
  secretKey: string;
  publicKey: string;
  createdAt: string;
};
