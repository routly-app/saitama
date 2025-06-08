import { Crud } from "@saitamafun/shared";

import type { Customer } from "./models/customer.model";

export class CustomerApi extends Crud<Customer> {
  protected path: string = "customers";
}
