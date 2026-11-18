import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { z } from "zod";

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
};

const mongoClient =
  globalForMongo.mongoClient ??
  new MongoClient(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017",
  );

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = mongoClient;
}

const database = mongoClient.db(process.env.MONGODB_DB || "wedplan");

export const auth = betterAuth({
  appName: "WedPlan",
  database: mongodbAdapter(database),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const role = user.role ?? "customer";
          if (role !== "customer" && role !== "vendor") {
            throw new APIError("BAD_REQUEST", {
              message: "New accounts must use the customer or vendor role.",
            });
          }
          return { data: { ...user, role } };
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (context) => {
      if (context.path !== "/sign-up/email") {
        return;
      }

      const password = context.body.password;
      if (
        typeof password !== "string" ||
        !/(?=.*[a-z])(?=.*[A-Z]).{6,}/.test(password)
      ) {
        throw new APIError("BAD_REQUEST", {
          message:
            "Password must be at least 6 characters and include an uppercase and a lowercase letter.",
        });
      }
    }),
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
        validator: { input: z.enum(["customer", "vendor"]) },
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      businessName: {
        type: "string",
        required: false,
        input: false,
      },
      subscriptionPlan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
      subscriptionExpiresAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  plugins: [jwt()],
});
