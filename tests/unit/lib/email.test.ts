/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock Resend module - must be before any imports
// Use vi.hoisted to define the mock function that can be accessed in both mock and tests
const { mockSendFn } = vi.hoisted(() => {
  return {
    mockSendFn: vi.fn().mockResolvedValue({ id: "test-email-id" }),
  };
});

vi.mock("resend", () => {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: mockSendFn,
      },
    })),
  };
});

// Import after mocking
import { sendPasswordResetEmail } from "@/lib/email";

describe("email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendFn.mockClear();
    mockSendFn.mockResolvedValue({ id: "test-email-id" });
  });

  describe("sendPasswordResetEmail", () => {
    it("should send password reset email with correct recipient and subject", async () => {
      const email = "test@example.com";
      const resetUrl = "https://example.com/reset?token=abc123";

      await sendPasswordResetEmail(email, resetUrl);

      expect(mockSendFn).toHaveBeenCalledTimes(1);
      const callArgs = mockSendFn.mock.calls[0]?.[0];
      expect(callArgs?.to).toBe(email);
      expect(callArgs?.subject).toBe("Reset your password");
    });

    it("should use default from email when RESEND_FROM_EMAIL is not set", async () => {
      const originalEnv = process.env.RESEND_FROM_EMAIL;
      delete process.env.RESEND_FROM_EMAIL;

      const email = "test@example.com";
      const resetUrl = "https://example.com/reset?token=abc123";

      await sendPasswordResetEmail(email, resetUrl);

      const callArgs = mockSendFn.mock.calls[0]?.[0];
      expect(callArgs?.from).toBe("Historian <noreply@historian.archit.xyz>");

      // Restore original env
      if (originalEnv) {
        process.env.RESEND_FROM_EMAIL = originalEnv;
      }
    });

    it("should use custom from email when RESEND_FROM_EMAIL is set", async () => {
      const originalEnv = process.env.RESEND_FROM_EMAIL;
      process.env.RESEND_FROM_EMAIL = "custom@example.com";

      const email = "test@example.com";
      const resetUrl = "https://example.com/reset?token=abc123";

      await sendPasswordResetEmail(email, resetUrl);

      const callArgs = mockSendFn.mock.calls[0]?.[0];
      expect(callArgs?.from).toBe("Historian <custom@example.com>");

      // Restore original env
      if (originalEnv) {
        process.env.RESEND_FROM_EMAIL = originalEnv;
      } else {
        delete process.env.RESEND_FROM_EMAIL;
      }
    });

    it("should include reset URL in email HTML", async () => {
      const email = "test@example.com";
      const resetUrl = "https://example.com/reset?token=abc123";

      await sendPasswordResetEmail(email, resetUrl);

      const callArgs = mockSendFn.mock.calls[0]?.[0];
      expect(callArgs?.html).toContain(resetUrl);
      expect(callArgs?.html).toContain('href="https://example.com/reset?token=abc123"');
    });

    it("should include proper email structure with HTML", async () => {
      const email = "test@example.com";
      const resetUrl = "https://example.com/reset?token=abc123";

      await sendPasswordResetEmail(email, resetUrl);

      const callArgs = mockSendFn.mock.calls[0]?.[0];
      expect(callArgs?.html).toContain("<!DOCTYPE html>");
      expect(callArgs?.html).toContain("<html>");
      expect(callArgs?.html).toContain("Reset your password");
      expect(callArgs?.html).toContain("Reset Password");
      expect(callArgs?.html).toContain("This link will expire in 1 hour");
    });

    it("should include Historian branding in email", async () => {
      const email = "test@example.com";
      const resetUrl = "https://example.com/reset?token=abc123";

      await sendPasswordResetEmail(email, resetUrl);

      const callArgs = mockSendFn.mock.calls[0]?.[0];
      expect(callArgs?.html).toContain("🕵️");
      expect(callArgs?.html).toContain("Historian");
      expect(callArgs?.html).toContain("Your browsing history, organized");
    });

    it("should handle special characters in reset URL", async () => {
      const email = "test@example.com";
      const resetUrl = "https://example.com/reset?token=abc123&expires=2024-01-01";

      await sendPasswordResetEmail(email, resetUrl);

      const callArgs = mockSendFn.mock.calls[0]?.[0];
      expect(callArgs?.html).toContain(resetUrl);
    });

    it("should call resend.emails.send with correct parameters", async () => {
      const email = "test@example.com";
      const resetUrl = "https://example.com/reset?token=abc123";

      await sendPasswordResetEmail(email, resetUrl);

      expect(mockSendFn).toHaveBeenCalledTimes(1);
      const callArgs = mockSendFn.mock.calls[0]?.[0];
      expect(callArgs).toHaveProperty("from");
      expect(callArgs).toHaveProperty("to");
      expect(callArgs).toHaveProperty("subject");
      expect(callArgs).toHaveProperty("html");
    });
  });
});
