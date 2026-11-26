import { describe, expect, it } from "vitest";
import { listCricketPlayers } from "@/lib/seo/cricket-entities";

const INVALID_NAMES = new Set([
  "multiple",
  "sri lanka",
  "england",
  "west indies",
  "pakistan",
  "india",
  "australia",
  "south africa",
  "new zealand",
  "bangladesh",
  "afghanistan",
  "ireland",
  "zimbabwe",
]);

describe("cricket player entities", () => {
  it("never publishes a team name or 'Multiple' as a player", () => {
    const invalid = listCricketPlayers()
      .filter((player) => INVALID_NAMES.has(player.name.trim().toLowerCase()))
      .map((player) => player.name);
    expect(invalid).toEqual([]);
  });
});
