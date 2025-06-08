import moment from "moment";
import { Column } from "drizzle-orm";

import { RequestError } from "../../error";

export const normalizeBoolean = (column: Column, value: string) => {
  if (Number.isNaN(Number(value))) {
    switch (value) {
      case "true":
        return true;
      case "false":
        return false;
      default:
        throw new RequestError(
          400,
          "expected a truthy value for " + column.name
        );
    }
  } else return Boolean(Number(value));
};

export const normalizeNumber = (column: Column, input: string) => {
  const value = Number(input);
  if (Number.isNaN(value))
    throw new RequestError(400, "number expected for " + column.name);
  return value;
};

export const normalizeValue = <TColumn extends Column, TValue extends string>(
  column: TColumn,
  value: TValue
) => {
  const normalize = () => {
    if (!column.notNull && ["null", "undefined"].includes(value)) return null;
    switch (column.dataType) {
      case "bigint":
        return BigInt(value);
      case "date":
        return moment(value).toDate();
      case "boolean":
        return normalizeBoolean(column, value);
      case "json":
        throw new RequestError(400, "json not supported as filter.");
      case "number":
        return normalizeNumber(column, value);
      case "custom":
      case "string":
        return value;
      case "array":
        throw new RequestError(500, "array not supported as filter.");
      case "buffer":
        throw new RequestError(500, "buffer not supported as filter.");
    }
  };

  return normalize() as TColumn["dataType"];
};
