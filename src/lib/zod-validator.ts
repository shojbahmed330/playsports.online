import { z } from "zod";
import type { ValidatorAdapter } from "@tanstack/react-router";

/**
 * Local replacement for `@tanstack/zod-adapter`, whose latest release still
 * peers on zod 3. Mirrors the adapter's runtime shape so TanStack Router's
 * search validation and middleware types stay intact.
 */
export function zodValidator<TSchema extends z.ZodType>(
  schema: TSchema,
): ValidatorAdapter<z.input<TSchema>, z.output<TSchema>> {
  return {
    types: {
      input: undefined as unknown as z.input<TSchema>,
      output: undefined as unknown as z.output<TSchema>,
    },
    parse: (input: unknown) => schema.parse(input),
  };
}

/** Search-param schema that falls back to defaults instead of throwing. */
export function fallback<TSchema extends z.ZodType>(
  schema: TSchema,
  value: z.output<TSchema>,
) {
  return z.custom().pipe(schema.catch(value));
}
