import { describe, it, expect } from "vitest";
import { isValidWordLength, SHORT_WORDS } from "./shortWords";

describe("shortWords", () => {
  describe("isValidWordLength", () => {
    it("should accept words with 3 or more characters", () => {
      expect(isValidWordLength("cat")).toBe(true);
      expect(isValidWordLength("hello")).toBe(true);
      expect(isValidWordLength("supercalifragilistic")).toBe(true);
    });

    it("should accept valid 1-letter words", () => {
      expect(isValidWordLength("a")).toBe(true);
      expect(isValidWordLength("i")).toBe(true);
      expect(isValidWordLength("A")).toBe(true);
      expect(isValidWordLength("I")).toBe(true);
    });

    it("should reject invalid 1-letter words", () => {
      expect(isValidWordLength("b")).toBe(false);
      expect(isValidWordLength("x")).toBe(false);
      expect(isValidWordLength("z")).toBe(false);
    });

    it("should accept valid 2-letter words", () => {
      expect(isValidWordLength("am")).toBe(true);
      expect(isValidWordLength("by")).toBe(true);
      expect(isValidWordLength("do")).toBe(true);
      expect(isValidWordLength("he")).toBe(true);
      expect(isValidWordLength("if")).toBe(true);
      expect(isValidWordLength("in")).toBe(true);
      expect(isValidWordLength("is")).toBe(true);
      expect(isValidWordLength("it")).toBe(true);
      expect(isValidWordLength("me")).toBe(true);
      expect(isValidWordLength("no")).toBe(true);
      expect(isValidWordLength("of")).toBe(true);
      expect(isValidWordLength("ok")).toBe(true);
      expect(isValidWordLength("on")).toBe(true);
      expect(isValidWordLength("or")).toBe(true);
      expect(isValidWordLength("so")).toBe(true);
      expect(isValidWordLength("to")).toBe(true);
      expect(isValidWordLength("up")).toBe(true);
      expect(isValidWordLength("us")).toBe(true);
      expect(isValidWordLength("we")).toBe(true);
    });

    it("should reject invalid 2-letter words", () => {
      expect(isValidWordLength("zz")).toBe(false);
      expect(isValidWordLength("xq")).toBe(false);
      expect(isValidWordLength("ab")).toBe(false);
    });

    it("should be case-insensitive", () => {
      expect(isValidWordLength("AM")).toBe(true);
      expect(isValidWordLength("By")).toBe(true);
      expect(isValidWordLength("DO")).toBe(true);
    });
  });

  describe("SHORT_WORDS set", () => {
    it("should contain exactly 55 entries", () => {
      expect(SHORT_WORDS.size).toBe(56);
    });

    it("should contain only lowercase entries", () => {
      for (const word of SHORT_WORDS) {
        expect(word).toBe(word.toLowerCase());
      }
    });
  });
});
