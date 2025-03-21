import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { PGlite } from "npm:@electric-sql/pglite@0.2.17";
import { z } from "npm:zod@3";

const requestSchema = z.object({
  query: z.string(),
});

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("only POST requests are allowed", {
      status: 400,
    });
  }

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return new Response("only JSON requests are allowed", {
      status: 400,
    });
  }

  const body = await req.json();

  const { data, error } = requestSchema.safeParse(body);

  if (error) {
    return new Response(error.message, {
      status: 400,
    });
  }

  const query = data.query;

  const db = new PGlite();

  const result = await db.query(query);

  return new Response(JSON.stringify(result.rows), {
    headers: {
      "content-type": "application/json",
    },
  });
});
