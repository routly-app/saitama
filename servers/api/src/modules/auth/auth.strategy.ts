import { eq } from "drizzle-orm";
import type express from "express";
import { Strategy } from "passport-strategy";
import { getAuth } from "firebase-admin/auth";

import { db } from "../../instances";
import { apiKeys, users } from "../../db/schema";

export class FirebaseStrategy extends Strategy {
  authenticate(request: express.Request) {
    const authorization = request.headers.authorization;

    if (authorization) {
      const [, value] = authorization.split(/\s+/g);

      console.log(value);

      if (value) {
        const auth = getAuth();

        return auth
          .verifyIdToken(value)
          .then(async (firebaseUser) => {
            const value = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              isVerified: firebaseUser.email_verified,
              lastLogin: new Date(firebaseUser.auth_time),
            };

            console.log(value);

            const [user] = await db
              .insert(users)
              .values(value)
              .onConflictDoUpdate({ target: [users.id], set: value })
              .returning()
              .execute();

            console.log(user);

            this.success(user);
          })
          .catch((error) => {
            console.error(error);
            this.fail(error, 401);
          });
      }
    }

    return this.fail("authorization required in headers", 400);
  }
}

export class ApiKeyStrategy extends Strategy {
  authenticate(request: express.Request) {
    const authorization = request.headers.authorization;

    if (authorization) {
      const [, value] = authorization.split(/\s+/g);
      if (value) {
        return db.query.apiKeys
          .findFirst({
            where: eq(apiKeys.publicKey, value),
            with: {
              app: {
                with: {
                  user: true,
                },
                columns: {
                  id: true,
                  user: false,
                },
              },
            },
            columns: {
              id: true,
              app: false,
            },
          })
          .execute()
          .then((apiKey) => {
            if (apiKey)
              return this.success({ ...apiKey.app.user, app: apiKey.app });
            return this.fail("not authorized", 401);
          })
          .catch((error) => this.fail(error, 401));
      }
    }

    return this.fail("authorization required in headers", 400);
  }
}
