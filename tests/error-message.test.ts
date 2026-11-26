import { describe, expect, it } from "vitest";
import { errorMessage } from "@/lib/error-message";

describe("errorMessage", () => {
  it("reads an Error message", () => {
    expect(errorMessage(new Error("Network unavailable"))).toBe("Network unavailable");
  });

  it("accepts a string", () => {
    expect(errorMessage("  Timeout  ")).toBe("Timeout");
  });

  it("falls back for unknown values and empty errors", () => {
    expect(errorMessage(null)).toBe("Something went wrong. Please try again.");
    expect(errorMessage(new Error("   "))).toBe("Something went wrong. Please try again.");
  });
});
