import { readFileSync } from "fs";
import { type z, string } from "zod";
import fastifyCors from "@fastify/cors";
import { format } from "@saitamafun/shared";
import fastifySwagger from "@fastify/swagger";
import fastifyPassport from "@fastify/passport";
import fastifySocketIO from "fastify-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import fastifySecureSession from "@fastify/secure-session";
import fastifyApiReference from "@scalar/fastify-api-reference";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import { type FastifyInstance, type FastifyRequest } from "fastify";

import { credential } from "firebase-admin";
import { initializeApp, type ServiceAccount } from "firebase-admin/app";

import { getEnv } from "./env";
import type { Database } from "./db";
import { RequestError } from "./error";
import registerRoutes from "./modules";
import type { selectUserSchema } from "./db/zod";
import { onEthereumLogs, onSolanaLogs } from "./watch";
import { db, fastify, redis, solana, viem } from "./instances";
import { getUserById } from "./modules/users/users.controller";
import { getAppByUserAndId } from "./modules/apps/app.controller";
import { ApiKeyStrategy, FirebaseStrategy } from "./modules/auth/auth.strategy";

async function main(fastify: FastifyInstance, db: Database) {
  initializeApp({
    credential: credential.cert(getEnv<ServiceAccount>("SERVICE_ACCOUNT")!),
  });

  // @ts-expect-error
  await fastify.register(fastifySocketIO, {
    cors: { origin: [/localhost/] },
    adapter: createAdapter(
      await redis.connect(),
      await redis.duplicate().connect()
    ),
  });
  await fastify.register(fastifySecureSession, {
    key: readFileSync("secret-key"),
  });
  await fastify.register(fastifyCors, {
    origin: [/localhost/],
  });

  await fastify.register(fastifyPassport.initialize());
  await fastify.register(fastifyPassport.secureSession());
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Saitama API Documentation",
        description:
          "Explore resources, tutorials, API docs and dynamic examples to get most out of saitama's developer platform.",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          apiKey: {
            type: "apiKey",
            name: "apiKey",
            in: "header",
          },
          authorization: {
            type: "http",
            scheme: "Bearer",
          },
          jwt: {
            type: "http",
            scheme: "Bearer",
          },
        },
      },
    },
  });

  await fastify.register(fastifyApiReference, {
    routePrefix: "/docs/",
    configuration: {
      title: "",
      theme: "laserwave",
    },
  });

  fastifyPassport.use("apiKey", new ApiKeyStrategy());
  fastifyPassport.use("firebase", new FirebaseStrategy());
  fastifyPassport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: getEnv("SECRET_KEY")!,
        passReqToCallback: true,
      },
      async (request: FastifyRequest, payload, done) => {
        let app = undefined;
        const appId = request.headers["x-app-id"] as string | undefined;

        if (payload.id) {
          const user = await getUserById(db, payload.id).then((user) => user);
          if (user) {
            if (appId && string().safeParse(appId).success)
              app = await getAppByUserAndId(db, user.id, appId);
            return done(null, { ...user, app });
          }

          done(null, null);
        }

        return done(new RequestError(500, "invalid jwt payload"), null);
      }
    )
  );

  fastifyPassport.registerUserSerializer<
    z.infer<typeof selectUserSchema>,
    Pick<z.infer<typeof selectUserSchema>, "id">
  >(async (user) => ({ id: user.id }));

  fastifyPassport.registerUserDeserializer<
    Pick<z.infer<typeof selectUserSchema>, "id">,
    z.infer<typeof selectUserSchema>
  >(async (payload) => {
    const user = await getUserById(db, payload.id);

    if (user) return user;

    throw new RequestError(404, format("user with id=% not found", payload.id));
  });

  await registerRoutes(fastify);

  await fastify.ready();
  await Promise.all([
    fastify.listen({
      host: getEnv<string>("HOST")!,
      port: getEnv("PORT", Number)!,
    }),
    onEthereumLogs(db, fastify, viem),
    onSolanaLogs(db, fastify, solana),
  ]);

  process.on("SIGINT", () => fastify.close());
  process.on("SIGTERM", () => fastify.close());
}

main(fastify, db);
