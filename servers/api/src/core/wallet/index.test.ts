import moment from "moment";
import { expect, test } from "bun:test";
import { generateMnemonic } from "bip39";

import { generateAddressFromIndex } from "./generate";
import { getWallet } from ".";

test("wallet usage test", async () => {
  const mnemonic = generateMnemonic();
  const maxIndex = 4;
  const maxAge = moment.duration(10, "seconds").asSeconds();

  const fixedAddress1 = await generateAddressFromIndex(mnemonic, 1, "ethereum");
  const fixedAddress2 = await generateAddressFromIndex(mnemonic, 2, "ethereum");
  const fixedAddress3 = await generateAddressFromIndex(mnemonic, 3, "ethereum");
  const fixedAddress4 = await generateAddressFromIndex(mnemonic, 4, "ethereum");

  const [[, address1], [, address2], [, address3], [, address4]] =
    await Promise.all([
      getWallet(mnemonic, "ethereum", maxIndex, maxAge),
      getWallet(mnemonic, "ethereum", maxIndex, maxAge),
      getWallet(mnemonic, "ethereum", maxIndex, maxAge),
      getWallet(mnemonic, "ethereum", maxIndex, maxAge),
    ]);

  expect(fixedAddress1).toBe(address1);
  expect(fixedAddress2).toBe(address2);
  expect(fixedAddress3).toBe(address3);
  expect(fixedAddress4).toBe(address4);
});
