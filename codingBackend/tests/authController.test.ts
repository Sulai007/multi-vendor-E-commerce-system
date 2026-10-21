import express from "express";
import request from "supertest";
import { getProfile, logOutUser } from "../src/services/auth.service";
import { errorHandler } from "../src/middleware/errorHandler.middleware";
import { logout, me } from "../src/controllers/auth.controller";

jest.mock("../src/services/auth.service", () => ({
  getProfile: jest.fn(),
  logOutUser: jest.fn(),
}));

jest.mock("../src/utils/logger", () => ({ logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() } }));

const makeApp = (authenticated: boolean) => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    if (authenticated) {
      req.user = {
        sub: "user-1",
        email: "user@example.com",
        role: "user",
        jti: "access-1",
        exp: 1_800_000_000,
      };
    }
    next();
  });
  app.get("/me", me);
  app.post("/logout", logout);
  app.use(errorHandler);
  return app;
};

describe("auth controllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the current user's profile", async () => {
    const profile = { id: "user-1", email: "user@example.com" };
    jest.mocked(getProfile).mockResolvedValue(profile as never);

    const response = await request(makeApp(true)).get("/me").expect(200);

    expect(getProfile).toHaveBeenCalledWith("user-1");
    expect(response.body.data.user).toEqual(profile);
  });

  it("passes the refresh token and access claims to logout service", async () => {
    jest.mocked(logOutUser).mockResolvedValue(undefined);

    const response = await request(makeApp(true))
      .post("/logout")
      .send({ refreshToken: "refresh-token" })
      .expect(200);

    expect(logOutUser).toHaveBeenCalledWith("refresh-token", expect.objectContaining({
      sub: "user-1",
      jti: "access-1",
    }));
    expect(response.body.success).toBe(true);
  });

  it("rejects logout when the request has no authenticated user", async () => {
    await request(makeApp(false))
      .post("/logout")
      .send({ refreshToken: "refresh-token" })
      .expect(401);

    expect(logOutUser).not.toHaveBeenCalled();
  });
});