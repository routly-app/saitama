import type { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";

import type { Database } from "../../db";
import { networks } from "../../db/schema";
import type { selectNetworkSchema } from "../../db/zod";

export const getNetworks = (db: Database) =>
  db.query.networks
    .findMany({
      with: {
        coins: {
          where: and(isNull(networks.creator)),
        },
        // subchains: {
        //   columns: {
        //     parent: false,
        //   },
        // },
      },
      columns: {
        parent: false,
      },
    })
    .execute();

export const getNetworkById = (
  db: Database,
  id: z.infer<typeof selectNetworkSchema>["id"]
) =>
  db.query.networks
    .findFirst({
      where: eq(networks.id, id),
    })
    .execute();
