import { loginUser, resendOtp, verifyOtp } from "../src/services/auth.service";
import { Otp, RefreshToken, User, vendorBusiness } from "../src/models";
import { comparePassword } from "../src/helper/passwordHelper";
import { hashToken, signAccessToken, signRefreshToken } from "../src/helper/tokenHelper";
import { compareOtp, generateOtpCode, hashOtp, otpExpiryDate } from "../src/helper/otpHelper";

jest.mock("../src/models", () => ({
  User: { scope: jest.fn(), findOne: jest.fn() },
  Otp: { update: jest.fn(), findOne: jest.fn(), create: jest.fn() },
  RefreshToken: { create: jest.fn() },
  BlacklistedToken: { findOrCreate: jest.fn() },
  vendorBusiness: { findOne: jest.fn() },
}));

jest.mock("../src/helper/passwordHelper", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock("../src/helper/tokenHelper", () => ({
  signAccessToken: jest.fn(),
  signBusinessAccessToken: jest.fn(),
  signRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  hashToken: jest.fn(),
  signPasswordResetToken: jest.fn(),
  verifyPasswordResetToken: jest.fn(),
}));

jest.mock("../src/helper/otpHelper", () => ({
  generateOtpCode: jest.fn(),
  hashOtp: jest.fn(),
  compareOtp: jest.fn(),
  otpExpiryDate: jest.fn(),
}));

jest.mock("../src/email/authEmail", () => ({
  sendOtpEmail: jest.fn(),
  sendPasswordChangedEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
}));

jest.mock("../src/email/mailDelivery", () => ({
  sendEmailSafely: jest.fn((send: () => Promise<void>) => send()),
}));

const makeUser = (overrides: Record<string, unknown> = {}) => ({
  id: "user-1",
  email: "user@example.com",
  password: "password-hash",
  role: "customer",
  isActive: true,
  isEmailVerified: true,
  lastLoginAt: null,
  save: jest.fn().mockResolvedValue(undefined),
  toSafeJSON: jest.fn(() => ({ id: "user-1", email: "user@example.com" })),
  ...overrides,
});

const useScopedUser = (user: ReturnType<typeof makeUser> | null) => {
  const findOne = jest.fn().mockResolvedValue(user);
  jest.mocked(User.scope).mockReturnValue({ findOne } as never);
  return findOne;
};

describe("auth login service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects invalid credentials without issuing refresh tokens", async () => {
    useScopedUser(makeUser());
    jest.mocked(comparePassword).mockResolvedValue(false);

    await expect(
      loginUser({ email: "user@example.com", password: "wrong" }, {}),
    ).rejects.toMatchObject({ statusCode: 401, message: "Invalid email or password." });

    expect(RefreshToken.create).not.toHaveBeenCalled();
  });

  it("blocks login until the email has been verified", async () => {
    useScopedUser(makeUser({ isEmailVerified: false }));
    jest.mocked(comparePassword).mockResolvedValue(true);

    await expect(
      loginUser({ email: "user@example.com", password: "correct" }, {}),
    ).rejects.toMatchObject({ statusCode: 401, message: expect.stringContaining("Email is not verified") });

    expect(RefreshToken.create).not.toHaveBeenCalled();
  });

  it("issues tokens and stores only the hashed refresh token on success", async () => {
    const user = makeUser();
    const expiresAt = new Date("2027-01-01T00:00:00.000Z");
    const meta = { userAgent: "test-agent", ipAddress: "127.0.0.1" };
    useScopedUser(user);
    jest.mocked(comparePassword).mockResolvedValue(true);
    jest.mocked(signAccessToken).mockReturnValue({ token: "access-token", jti: "access-id", expiresAt });
    jest.mocked(signRefreshToken).mockReturnValue({ token: "raw-refresh-token", jti: "refresh-id", expiresAt });
    jest.mocked(hashToken).mockReturnValue("hashed-refresh-token");
    jest.mocked(RefreshToken.create).mockResolvedValue({} as never);

    const result = await loginUser({ email: "user@example.com", password: "correct" }, meta);

    expect(RefreshToken.create).toHaveBeenCalledWith({
      userId: "user-1",
      tokenHash: "hashed-refresh-token",
      expiresAt,
      userAgent: "test-agent",
      ipAddress: "127.0.0.1",
    });
    expect(result).toMatchObject({
      user: { id: "user-1", email: "user@example.com" },
      accessToken: "access-token",
      refreshToken: "raw-refresh-token",
    });
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(user.lastLoginAt).toBeInstanceOf(Date);
    expect(vendorBusiness.findOne).not.toHaveBeenCalled();
  });

  it("sends a welcome email after verifying an email address", async () => {
    const user = makeUser({ firstName: "Riley" });
    const otp = {
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 0,
      codeHash: "hashed-code",
      save: jest.fn().mockResolvedValue(undefined),
    };
    jest.mocked(User.findOne).mockResolvedValue(user as never);
    jest.mocked(Otp.findOne).mockResolvedValue(otp as never);
    jest.mocked(compareOtp).mockResolvedValue(true);

    await expect(verifyOtp({ email: "user@example.com", code: "123456", purpose: "email_verification" }))
      .resolves.toMatchObject({ type: "email_verified" });

    expect(user.save).toHaveBeenCalledTimes(1);
    expect(jest.requireMock("../src/email/authEmail").sendWelcomeEmail)
      .toHaveBeenCalledWith({ to: "user@example.com", firstName: "Riley" });
  });

  it("resends a password reset OTP for a known email", async () => {
    const user = makeUser({ firstName: "Riley" });
    jest.mocked(User.findOne).mockResolvedValue(user as never);
    jest.mocked(Otp.findOne).mockResolvedValue(null);
    jest.mocked(generateOtpCode).mockReturnValue("654321");
    jest.mocked(hashOtp).mockResolvedValue("hashed-code");
    jest.mocked(otpExpiryDate).mockReturnValue(new Date("2027-01-01T00:00:00.000Z"));

    await expect(resendOtp({ email: "user@example.com", purpose: "password_reset" })).resolves.toBeUndefined();

    expect(Otp.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-1",
      codeHash: "hashed-code",
      purpose: "password_reset",
    }));
    expect(jest.requireMock("../src/email/authEmail").sendOtpEmail)
      .toHaveBeenCalledWith({
        to: "user@example.com",
        firstName: "Riley",
        code: "654321",
        purpose: "password_reset",
      });
  });
});