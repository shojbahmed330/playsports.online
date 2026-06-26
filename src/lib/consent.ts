import { useEffect, useState, useCallback } from "react";

export type ConsentChoice = {
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  affiliate: boolean;
  decided: boolean;
};

const KEY = "asl_consent_v1";
const COOKIE = "asl_consent_v1";

export const DEFAULT_CONSENT_CHOICE: ConsentChoice = {
  necessary: true,
  analytics: false,
  advertising: false,
  affiliate: false,
  decided: false,
};

const ACCEPT_ALL: ConsentChoice = {
  necessary: true,
  analytics: true,
  advertising: true,
  affiliate: true,
  decided: true,
};
const REJECT_ALL: ConsentChoice = { ...DEFAULT_CONSENT_CHOICE, decided: true };

function writeCookie(value: string) {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${COOKIE}=${encodeURIComponent(value)}; max-age=${oneYear}; path=/; samesite=lax`;
}

export function readConsent(): ConsentChoice {
  if (typeof window === "undefined") return DEFAULT_CONSENT_CHOICE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_CONSENT_CHOICE;
    const parsed = JSON.parse(raw) as Partial<ConsentChoice>;
    return { ...DEFAULT_CONSENT_CHOICE, ...parsed, necessary: true };
  } catch {
    return DEFAULT_CONSENT_CHOICE;
  }
}

export function writeConsent(c: ConsentChoice) {
  if (typeof window === "undefined") return;
  const value = JSON.stringify(c);
  window.localStorage.setItem(KEY, value);
  writeCookie(value);
  window.dispatchEvent(new CustomEvent("asl:consent-changed", { detail: c }));
}

export function useConsent() {
  const [choice, setChoice] = useState<ConsentChoice>(DEFAULT_CONSENT_CHOICE);

  useEffect(() => {
    setChoice(readConsent());
    const onChange = (e: Event) => {
      const c = (e as CustomEvent<ConsentChoice>).detail;
      if (c) setChoice(c);
    };
    window.addEventListener("asl:consent-changed", onChange);
    return () => window.removeEventListener("asl:consent-changed", onChange);
  }, []);

  const acceptAll = useCallback(() => writeConsent(ACCEPT_ALL), []);
  const rejectAll = useCallback(() => writeConsent(REJECT_ALL), []);
  const save = useCallback(
    (partial: Partial<ConsentChoice>) =>
      writeConsent({ ...readConsent(), ...partial, necessary: true, decided: true }),
    [],
  );
  const reopen = useCallback(
    () => window.dispatchEvent(new CustomEvent("asl:consent-open")),
    [],
  );

  return { choice, acceptAll, rejectAll, save, reopen };
}
