/** Turn an unknown thrown value into a safe, human-readable sentence. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  if (typeof error === "string" && error.trim()) return error.trim();
  return "Something went wrong. Please try again.";
}
