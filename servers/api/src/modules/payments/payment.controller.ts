import type { z } from "zod";
import { and, eq, inArray, SQL } from "drizzle-orm";

import type { Database } from "../../db";
import { paymentLinks, payments } from "../../db/schema";
import type {
  insertPaymentSchema,
  selectAppSchema,
  selectPaymentSchema,
} from "../../db/zod";

export const createPayment = async (
  db: Database,
  value: z.infer<typeof insertPaymentSchema>
) => {
  const [payment] = await db
    .insert(payments)
    .values(value)
    .returning({ id: payments.id })
    .execute();
  if (payment) return getPaymentById(db, payment.id);
};

export const getPaymentsByAppWhere = (
  db: Database,
  app: z.infer<typeof selectAppSchema>["id"],
  where?: SQL<unknown>
) => {
  return db.query.payments.findMany({
    with: {
      paymentLink: true,
      wallet: {
        columns: {
          id: true,
          address: true,
        },
      },
      coin: {
        with: {
          network: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        columns: {
          id: true,
          name: true,
          ticker: true,
          decimals: true,
        },
      },
      customer: {
        columns: {
          id: true,
          email: true,
        },
      },
    },
    columns: {
      id: true,
      amount: true,
      status: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
    },
    where: and(
      where,
      inArray(
        payments.paymentLink,
        db
          .select({ id: paymentLinks.id })
          .from(paymentLinks)
          .where(eq(paymentLinks.app, app))
      )
    ),
  });
};

export const getPaymentByAppAndId = (
  db: Database,
  app: z.infer<typeof selectAppSchema>["id"],
  id: z.infer<typeof selectPaymentSchema>["id"]
) => {
  return db.query.payments
    .findFirst({
      with: {
        paymentLink: true,
        wallet: {
          columns: {
            id: true,
            address: true,
          },
        },
        coin: {
          with: {
            network: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
          columns: {
            id: true,
            name: true,
            ticker: true,
            decimals: true,
          },
        },
        customer: {
          columns: {
            id: true,
            email: true,
          },
        },
      },
      columns: {
        id: true,
        amount: true,
        status: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
      where: and(
        eq(payments.id, id),
        inArray(
          payments.paymentLink,
          db
            .select({ id: paymentLinks.id })
            .from(paymentLinks)
            .where(eq(paymentLinks.app, app))
        )
      ),
    })
    .execute();
};

export const getPaymentById = (
  db: Database,
  id: z.infer<typeof selectPaymentSchema>["id"]
) => {
  return db.query.payments
    .findFirst({
      with: {
        paymentLink: true,
        wallet: {
          columns: {
            id: true,
            address: true,
          },
        },
        coin: {
          with: {
            network: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
          columns: {
            id: true,
            name: true,
            ticker: true,
            decimals: true,
          },
        },
        customer: {
          columns: {
            id: true,
            email: true,
          },
        },
      },
      columns: {
        id: true,
        amount: true,
        status: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
      where: and(
        eq(payments.id, id),
        inArray(
          payments.paymentLink,
          db.select({ id: paymentLinks.id }).from(paymentLinks)
        )
      ),
    })
    .execute();
};

export const updatePaymentByAppAndId = async (
  db: Database,
  app: z.infer<typeof selectAppSchema>["id"],
  id: z.infer<typeof selectPaymentSchema>["id"],
  value: Partial<z.infer<typeof insertPaymentSchema>>
) => {
  const [payment] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.id, id))
    .innerJoin(
      paymentLinks,
      and(eq(paymentLinks.app, app), eq(paymentLinks.id, payments.paymentLink))
    )
    .execute();

  if (payment) {
    await db
      .update(payments)
      .set(value)
      .where(eq(payments.id, payment.id))
      .returning()
      .execute();

    return getPaymentById(db, payment.id);
  }

  return null;
};

export const deletePaymentByPaymentLinkAndId = async (
  db: Database,
  app: z.infer<typeof selectAppSchema>["id"],
  id: z.infer<typeof selectPaymentSchema>["id"]
) => {
  const [payment] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.id, id))
    .innerJoin(
      paymentLinks,
      and(eq(paymentLinks.app, app), eq(paymentLinks.id, payments.paymentLink))
    )
    .execute();

  if (payment)
    return db
      .delete(payments)
      .where(eq(payments.id, payment.id))
      .returning()
      .execute();

  return null;
};
