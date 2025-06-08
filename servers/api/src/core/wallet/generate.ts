import bip32 from "bip32";
import { HDNodeWallet } from "ethers";
import * as ecc from "tiny-secp256k1";
import { mnemonicToSeed } from "bip39";
import { Keypair } from "@solana/web3.js";
import { format } from "@saitamafun/shared";
import { derivePath } from "ed25519-hd-key";

import { tronWeb } from "../../instances";

export const generateAddressFromIndex = async (
  mnemonic: string,
  index: number,
  network: "solana" | "ethereum" | "tron"
) => {
  let publicKey: string | undefined;
  const seed = await mnemonicToSeed(mnemonic);

  switch (network) {
    case "solana":
      {
        const path = format("m/44'/501'/%'/0'", index);
        const derived = derivePath(path, seed.toHex());
        const keypair = Keypair.fromSeed(derived.key);

        publicKey = keypair.publicKey.toBase58();
      }
      break;
    case "ethereum":
      {
        const path = format("m/44'/60'/0'/0/%", index);
        const keypair = HDNodeWallet.fromSeed(seed).derivePath(path);

        publicKey = keypair.address;
      }
      break;
    case "tron": {
      const path = format("m/44'/195'/0'/0/%", index);
      const derived = bip32(ecc).fromSeed(seed).derivePath(path);

      publicKey = tronWeb.address
        .fromPrivateKey(derived.privateKey!.toHex())
        .toString();
    }
  }
  return publicKey;
};

export const getWalletFromIndex = async (
  mnemonic: string,
  index: number,
  network: "solana" | "ethereum" | "tron"
) => {
  const seed = await mnemonicToSeed(mnemonic);

  let privateKey: string | undefined;
  let publicKey: string | undefined;

  switch (network) {
    case "solana":
      {
        const path = format("m/44'/501'/%'/0'", index);
        const derived = derivePath(path, seed.toHex());
        const keypair = Keypair.fromSeed(derived.key);

        privateKey = keypair.secretKey.toBase64();
        publicKey = keypair.publicKey.toBase58();
      }
      break;
    case "ethereum":
      {
        const path = format("m/44'/60'/0'/0/%", index);
        const keypair = HDNodeWallet.fromSeed(seed).derivePath(path);

        publicKey = keypair.address;
        privateKey = keypair.privateKey;
      }
      break;
    case "tron": {
      const path = format("m/44'/195'/0'/0/%", index);
      const derived = bip32(ecc).fromSeed(seed).derivePath(path);

      privateKey = derived.privateKey!.toHex();
      publicKey = tronWeb.address
        .fromPrivateKey(derived.privateKey!.toHex())
        .toString();
    }
  }
  return [privateKey, publicKey] as const;
};
