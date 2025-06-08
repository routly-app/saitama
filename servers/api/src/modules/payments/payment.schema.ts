import { object } from "zod";
import { string } from "../../db/zod-custom-type";
import {
  selectPaymentSchema,
  selectPaymentLinkSchema,
  selectWalletSchema1,
  selectCoinSchema,
  selectNetworkSchema,
  selectCustomerSchema,
} from "../../db/zod";

export const refinedPaymentSchema = selectPaymentSchema
  .pick({
    id: true,
    status: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
  })
  .and(
    object({
      amount: string(),
      paymentLink: selectPaymentLinkSchema,
      wallet: selectWalletSchema1.pick({
        id: true,
        address: true,
        metadata: true,
      }),
      coin: selectCoinSchema
        .pick({
          id: true,
          name: true,
          mint: true,
          ticker: true,
          decimals: true,
        })
        .and(
          object({
            network: selectNetworkSchema.pick({
              id: true,
              name: true,
            }),
          })
        ),
      customer: selectCustomerSchema.pick({
        id: true,
        email: true,
      }),
    })
  );
