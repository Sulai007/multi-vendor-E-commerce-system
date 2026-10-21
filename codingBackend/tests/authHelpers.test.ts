import { isStrongPassword } from "../src/helper/passwordHelper";
import {
  hashToken,
  signAccessToken,
  signBusinessAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../src/helper/tokenHelper";

jest.mock("uuid", () => ({ v4: jest.fn(() => "test-token-id") }));

describe("authentication helpers", () => {
  it("enforces the password composition policy", () => {
    expect(isStrongPassword("StrongPass1!")).toBe(true);
    expect(isStrongPassword("lowercase1!")).toBe(false);
    expect(isStrongPassword("NoNumber!")).toBe(false);
    expect(isStrongPassword("Short1!")).toBe(false);
  });

  it("signs access and refresh tokens with the expected subject", () => {
    const user = { id: "user-1", email: "user@example.com", role: "user" as const };
    const access = signAccessToken(user);
    const refresh = signRefreshToken(user.id);

    expect(verifyAccessToken(access.token)).toMatchObject({
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: access.jti,
    });
    expect(verifyRefreshToken(refresh.token)).toMatchObject({ sub: user.id, jti: refresh.jti });
    expect(access.expiresAt).toBeInstanceOf(Date);
    expect(refresh.expiresAt).toBeInstanceOf(Date);
  });

  it("includes the business claim and hashes tokens deterministically", () => {
    const access = signBusinessAccessToken({
      id: "user-1",
      email: "vendor@example.com",
      role: "vendor",
      businessId: "business-1",
    });
    const payload = verifyAccessToken(access.token);

    expect(payload.businessId).toBe("business-1");
    expect(hashToken("opaque-token")).toBe(hashToken("opaque-token"));
    expect(hashToken("opaque-token")).not.toBe("opaque-token");
  });
});