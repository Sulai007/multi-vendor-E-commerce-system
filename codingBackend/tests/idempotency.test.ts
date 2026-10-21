import express from "express";
import request from "supertest";
import { Idempotency } from "../src/models/idempotency";
import { idempotencyMiddleware } from "../src/middleware/idempotency";

jest.mock("../src/models/idempotency", () => ({
  Idempotency: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
  },
}));

const appWithHandler = (handler: jest.Mock = jest.fn((_req, res) => res.status(201).json({ saved: true }))) => {
  const app = express();
  app.use(express.json());
  app.post("/write", idempotencyMiddleware, handler);
  return { app, handler };
};

const uniqueConstraintError = () => {
  const error = new Error("duplicate idempotency key");
  error.name = "SequelizeUniqueConstraintError";
  return error;
};

describe("idempotency middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires a non-empty idempotency key", async () => {
    const { app, handler } = appWithHandler();

    const response = await request(app).post("/write").send({ saved: true }).expect(400);

    expect(response.body.error).toMatch(/Idempotency-Key/);
    expect(Idempotency.create).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });

  it("claims a new key and persists the response when the request finishes", async () => {
    const record = {
      status: "processing",
      update: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn().mockResolvedValue(undefined),
    };
    jest.mocked(Idempotency.create).mockResolvedValue(record as never);
    const { app } = appWithHandler();

    await request(app)
      .post("/write")
      .set("Idempotency-Key", "  order-123  ")
      .send({ amount: 4 })
      .expect(201, { saved: true });

    expect(Idempotency.create).toHaveBeenCalledWith(expect.objectContaining({
      key: "order-123",
      scope: expect.stringMatching(/^user:ip:/),
      requestHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      status: "processing",
    }));
    expect(record.update).toHaveBeenCalledWith(expect.objectContaining({
      status: "completed",
      statusCode: 201,
      responseData: { saved: true },
      completedAt: expect.any(Date),
    }));
  });

  it("replays the stored response for the same request", async () => {
    const existing = {
      id: "idem-1",
      status: "completed",
      statusCode: 202,
      responseData: { orderId: "order-1" },
      requestHash: "",
    };
    jest.mocked(Idempotency.create).mockImplementation(async (values) => {
      existing.requestHash = values?.requestHash ?? "";
      throw uniqueConstraintError();
    });
    jest.mocked(Idempotency.findOne).mockResolvedValue(existing as never);
    const handler = jest.fn((_req, res) => res.status(201).json({ fresh: true }));
    const { app } = appWithHandler(handler);

    const response = await request(app)
      .post("/write")
      .set("Idempotency-Key", "order-123")
      .send({ amount: 4 })
      .expect(202);

    expect(response.body).toEqual({ orderId: "order-1" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("rejects reuse of a key for a different request", async () => {
    jest.mocked(Idempotency.create).mockRejectedValue(uniqueConstraintError());
    jest.mocked(Idempotency.findOne).mockResolvedValue({
      id: "idem-1",
      status: "completed",
      requestHash: "different-request-hash",
    } as never);
    const { app, handler } = appWithHandler();

    const response = await request(app)
      .post("/write")
      .set("Idempotency-Key", "order-123")
      .send({ amount: 4 })
      .expect(409);

    expect(response.body.error).toMatch(/different request/);
    expect(handler).not.toHaveBeenCalled();
  });
});