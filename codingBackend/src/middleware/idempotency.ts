import { createHash } from "crypto";
import { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import { Idempotency } from "../models/idempotency";

const PROCESSING_TIMEOUT_MS = 30_000;
const WAIT_TIMEOUT_MS = 30_000;

const stableSerialize = (value: unknown): string => {
    if (value === null || typeof value !== "object") {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        return `[${value.map(stableSerialize).join(",")}]`;
    }

    return `{${Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${stableSerialize((value as Record<string, unknown>)[key])}`)
        .join(",")}}`;
};

const requestHash = (req: Request): string => createHash("sha256")
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

const getScope = (req: Request): string => `user:${req.user?.sub ?? `ip:${req.ip}`}`;

const wait = (milliseconds: number): Promise<void> => new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
});

const replay = (res: Response, record: Idempotency): void => {
    res.status(record.statusCode ?? 200).json(record.responseData);
};

const claimExpiredRecord = async (record: Idempotency): Promise<boolean> => {
    const [claimed] = await Idempotency.update(
        { lockedAt: new Date() },
        {
            where: {
                id: record.id,
                status: "processing",
                lockedAt: { [Op.lt]: new Date(Date.now() - PROCESSING_TIMEOUT_MS) },
            },
        },
    );
    return claimed === 1;
};

const findOrClaim = async (key: string, scope: string, hash: string): Promise<Idempotency> => {
    try {
        return await Idempotency.create({
            key,
            scope,
            requestHash: hash,
            status: "processing",
            statusCode: null,
            responseData: null,
            lockedAt: new Date(),
            completedAt: null,
        });
    } catch (error) {
        if (!(error instanceof Error) || !error.name.includes("UniqueConstraint")) {
            throw error;
        }

        const existing = await Idempotency.findOne({ where: { key, scope } });
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
            return (await Idempotency.findByPk(existing.id)) as Idempotency;
        }

        const deadline = Date.now() + WAIT_TIMEOUT_MS;
        while (Date.now() < deadline) {
            await wait(100);
            const current = await Idempotency.findByPk(existing.id);
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
                return (await Idempotency.findByPk(current.id)) as Idempotency;
            }
        }
        throw new Error("IDEMPOTENCY_REQUEST_IN_PROGRESS");
    }
};

export const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const idempotencyKey = req.header("Idempotency-Key")?.trim();
    if (!idempotencyKey || idempotencyKey.length > 255) {
        res.status(400).json({ error: "A valid Idempotency-Key header is required" });
        return;
    }

    let record: Idempotency;
    try {
        record = await findOrClaim(idempotencyKey, getScope(req), requestHash(req));
    } catch (error) {
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

    let responseBody: unknown;
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    res.json = ((body: unknown) => {
        responseBody = body;
        return originalJson(body);
    }) as Response["json"];
    res.send = ((body?: unknown) => {
        responseBody = body;
        return originalSend(body);
    }) as Response["send"];

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



