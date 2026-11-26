import { describe, expect, it } from "vitest";
import { formatSeasonLabel, getCompetition } from "@/lib/competitions";
import { getCatalogueSeries, getRelevantSeriesIds } from "@/lib/cricket-catalogue";

describe("football coverage", () => {
  it("registers the Premier League and Champions League with live ESPN ids", () => {
    expect(getCompetition("premier-league")?.espnLeague).toBe("eng.1");
    expect(getCompetition("champions-league")?.espnLeague).toBe("uefa.champions");
  });

  it("labels the current European season 2026/27 without relabelling history", () => {
    expect(formatSeasonLabel(getCompetition("premier-league")!, 2026)).toBe("2026/27");
    expect(formatSeasonLabel(getCompetition("champions-league")!, 2026)).toBe("2026/27");
    expect(formatSeasonLabel(getCompetition("laliga")!, 2026)).toBe("2026/27");
    expect(formatSeasonLabel(getCompetition("laliga")!, 2025)).toBe("2024/25");
  });
});

describe("cricket catalogue", () => {
  it("includes the current India–NZ and Bangladesh–South Africa tours", () => {
    const ids = getRelevantSeriesIds(Date.parse("2026-11-27T00:00:00Z"));
    expect(ids).toContain("1539421"); // India tour of New Zealand 2026/27
    expect(ids).toContain("1525639"); // Bangladesh in South Africa ODI Series 2026/27
  });

  it("has a readable label for every active series", () => {
    for (const id of getRelevantSeriesIds(Date.parse("2026-11-27T00:00:00Z"))) {
      expect(getCatalogueSeries(id)?.label.length, id).toBeGreaterThan(0);
    }
  });
});
