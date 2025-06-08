import { format } from "@saitamafun/shared";

export const toSVGURL = (svg: string) =>
  format("data:image/svg+xml;base64,%", btoa(svg));
