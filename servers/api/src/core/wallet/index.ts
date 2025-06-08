import moment from "moment";
import { format } from "@saitamafun/shared";

import { getEnv } from "../../env";
import { redis } from "../../instances";
import type { chains } from "../../config";
import { generateAddressFromIndex } from "./generate";

export const getWalletIndex = async (
  chain: (typeof chains)[number],
  index = 1,
  {
    maxIndex = 10,
    maxAge = moment
      .duration(getEnv("EXPIRED_AT", Number), "minutes")
      .asSeconds(),
  }: {
    index?: number;
    maxIndex?: number;
    maxAge?: number;
  }
): Promise<number> => {
  if (index > maxIndex)
    throw new Error("no free wallet found after multiple attempts");

  const key = format("%-%", chain, index);
  const walletInfo = await redis.get(key);

  if (!walletInfo) {
    const epoch = moment();
    const locked = await redis.setNX(
      key,
      JSON.stringify({
        epoch: epoch.toDate(),
        maxUseTime: maxAge,
      })
    );

    if (locked) {
      await redis.expire(key, maxAge);
      return index;
    }
  }

  return getWalletIndex(chain, index + 1, { maxIndex, maxAge });
};

export const getWallet = async (
  mnemonic: string,
  chain: (typeof chains)[number],
  maxIndex?: number,
  maxAge?: number
) => {
  const index = await getWalletIndex(chain, 1, { maxIndex, maxAge });
  return [
    index,
    await generateAddressFromIndex(mnemonic, index, chain),
  ] as const;
};
