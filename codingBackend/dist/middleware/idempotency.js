"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotencyMiddleware = void 0;
const crypto_1 = require("crypto");
const sequelize_1 = require("sequelize");
const idempotency_1 = require("../models/idempotency");
const PROCESSING_TIMEOUT_MS = 30000;
const WAIT_TIMEOUT_MS = 30000;
const stableSerialize = (value) => {
    if (value === null || typeof value !== "object") {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map(stableSerialize).join(",")}]`;
    }
    return `{${Object.keys(value)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
        .join(",")}}`;
};
const requestHash = (req) => (0, crypto_1.createHash)("sha256")
    .update(stableSerialize({
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    file: req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        size: req.file.size,
    } : undefined,
}))
    .digest("hex");
const getScope = (req) => `user:${req.user?.sub ?? `ip:${req.ip}`}`;
const wait = (milliseconds) => new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
});
const replay = (res, record) => {
    res.status(record.statusCode ?? 200).json(record.responseData);
};
const claimExpiredRecord = async (record) => {
    const [claimed] = await idempotency_1.Idempotency.update({ lockedAt: new Date() }, {
        where: {
            id: record.id,
            status: "processing",
            lockedAt: { [sequelize_1.Op.lt]: new Date(Date.now() - PROCESSING_TIMEOUT_MS) },
        },
    });
    return claimed === 1;
};
const findOrClaim = async (key, scope, hash) => {
    try {
        return await idempotency_1.Idempotency.create({
            key,
            scope,
            requestHash: hash,
            status: "processing",
            statusCode: null,
            responseData: null,
            lockedAt: new Date(),
            completedAt: null,
        });
    }
    catch (error) {
        if (!(error instanceof Error) || !error.name.includes("UniqueConstraint")) {
            throw error;
        }
        const existing = await idempotency_1.Idempotency.findOne({ where: { key, scope } });
        if (!existing) {
            return findOrClaim(key, scope, hash);
        }
        if (existing.requestHash !== hash) {
            throw new Error("IDEMPOTENCY_KEY_REUSED");
        }
        if (existing.status === "completed") {
            return existing;
        }
        if (await claimExpiredRecord(existing)) {
            return (await idempotency_1.Idempotency.findByPk(existing.id));
        }
        const deadline = Date.now() + WAIT_TIMEOUT_MS;
        while (Date.now() < deadline) {
            await wait(100);
            const current = await idempotency_1.Idempotency.findByPk(existing.id);
            if (!current) {
                return findOrClaim(key, scope, hash);
            }
            if (current.requestHash !== hash) {
                throw new Error("IDEMPOTENCY_KEY_REUSED");
            }
            if (current.status === "completed") {
                return current;
            }
            if (await claimExpiredRecord(current)) {
                return (await idempotency_1.Idempotency.findByPk(current.id));
            }
        }
        throw new Error("IDEMPOTENCY_REQUEST_IN_PROGRESS");
    }
};
const idempotencyMiddleware = async (req, res, next) => {
    const idempotencyKey = req.header("Idempotency-Key")?.trim();
    if (!idempotencyKey || idempotencyKey.length > 255) {
        res.status(400).json({ error: "A valid Idempotency-Key header is required" });
        return;
    }
    let record;
    try {
        record = await findOrClaim(idempotencyKey, getScope(req), requestHash(req));
    }
    catch (error) {
        if (error instanceof Error && error.message === "IDEMPOTENCY_KEY_REUSED") {
            res.status(409).json({ error: "Idempotency key was already used with a different request" });
            return;
        }
        if (error instanceof Error && error.message === "IDEMPOTENCY_REQUEST_IN_PROGRESS") {
            res.status(409).json({ error: "A request with this idempotency key is still processing" });
            return;
        }
        next(error);
        return;
    }
    if (record.status === "completed") {
        replay(res, record);
        return;
    }
    let responseBody;
    let jsonResponseCaptured = false;
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    res.json = ((body) => {
        responseBody = body;
        jsonResponseCaptured = true;
        return originalJson(body);
    });
    res.send = ((body) => {
        if (!jsonResponseCaptured) {
            responseBody = body;
        }
        return originalSend(body);
    });
    res.once("finish", () => {
        void (res.statusCode >= 500
            ? record.destroy()
            : record.update({
                status: "completed",
                statusCode: res.statusCode,
                responseData: responseBody ?? null,
                completedAt: new Date(),
            }));
    });
    next();
};
exports.idempotencyMiddleware = idempotencyMiddleware;
