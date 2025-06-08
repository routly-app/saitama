export const format = <
  T extends Array<string | number | object | null | undefined>
>(
  delimiter: string,
  ...values: T
) => {
  return String(
    values.reduce(
      (result, value) =>
        String(result).replace(/(%|%d|%s)/, value ? value.toString() : ""),
      delimiter
    )
  );
};

export const truncateAddress = (address: string, length = 10) => {
  const half = Math.floor(length / 3);
  return (
    address.slice(0, half) +
    "..." +
    address.slice(address.length - (length - half))
  );
};

export const toUIAmount = (amount: number | string) => {
  const strValue = amount.toString();

  if (!strValue.includes(".")) return strValue;

  const [integerPart, fractionalPart] = strValue.split(".");
  const firstSignificantIndex = [...fractionalPart].findIndex(
    (digit) => digit !== "0"
  );

  if (firstSignificantIndex === -1) return integerPart + ".00";

  const cutoffIndex = firstSignificantIndex + 2;
  const shortenedFraction = fractionalPart.slice(0, cutoffIndex);

  return integerPart + "." + shortenedFraction;
};
