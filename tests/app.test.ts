import request from "supertest";
import app from "../src/app";

describe("API endpoints", () => {
  describe("GET /api/health", () => {
    it("should return status ok", async () => {
      const response = await request(app).get("/api/health");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("GET /", () => {
    it("should return welcome message", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Welcome to the API");
    });
  });

  describe("GET /api/notfound", () => {
    it("should return 404 for unknown endpoint", async () => {
      const response = await request(app).get("/api/notfound");
      expect(response.status).toBe(404);
    });
  });
});
