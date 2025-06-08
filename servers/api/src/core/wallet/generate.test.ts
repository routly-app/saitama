import crypto from "crypto";
import { expect, test } from "bun:test";
import { generateMnemonic } from "bip39";

import { generateAddressFromIndex, getWalletFromIndex } from "./generate";

test("generate wallet bidirectional", async () => {
  const mnemonic = generateMnemonic();
  const index = crypto.randomInt(0, 1000000);
  const publicKey = await generateAddressFromIndex(mnemonic, index, "tron");
  const [, dPublicKey] = await getWalletFromIndex(mnemonic, index, "tron");

  console.log(mnemonic, publicKey, dPublicKey);

  expect(publicKey).toBe(dPublicKey);
});
