import "dotenv/config";

export default {
  schema: "./src/models/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: (globalThis as any).process?.env?.DATABASE_URL,
  },
};
