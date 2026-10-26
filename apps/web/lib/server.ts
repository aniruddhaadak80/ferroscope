import { NextResponse } from "next/server";
import type { z } from "zod";

export function jsonOk<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      "cache-control": "no-store",
      "x-ferroscope-version": "0.1.0",
      ...init?.headers,
    },
  });
}

export function jsonError(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { error: { code, message, ...(details === undefined ? {} : { details }) } },
    { status, headers: { "cache-control": "no-store" } },
  );
}

type ParseResult<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

export async function parseBody<S extends z.ZodTypeAny>(
  request: Request,
  schema: S,
): Promise<ParseResult<z.infer<S>>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: jsonError("invalid_json", "Body must be valid JSON.", 400) };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: jsonError(
        "invalid_profile",
        "The request did not match the exposure schema.",
        422,
        parsed.error.flatten(),
      ),
    };
  }

  return { ok: true, data: parsed.data };
}
