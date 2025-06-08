import { db } from "../instances";
import type { Database } from "../db";
import { seedCoin } from "./seedCoin";
import { seedNetwork } from "./seedNetwork";

function seed(db: Database) {
  return db.transaction((db) => Promise.all([seedNetwork(db), seedCoin(db)]));
}

seed(db)
  .then(() => console.log("seeding completed"))
  .catch((error) => console.error(error));
