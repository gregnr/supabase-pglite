// deno-lint-ignore-file require-await
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { PGlite } from "npm:@electric-sql/pglite@0.2.17";

Deno.serve(async (req) => {
  const upgrade = req.headers.get("upgrade");

  if (upgrade?.toLowerCase() !== "websocket") {
    return new Response("only websocket connections are allowed", {
      status: 400,
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  const db = new PGlite();

  socket.onopen = () => console.log("socket opened");

  socket.onmessage = async (e) => {
    const result = await db.query(e.data);
    socket.send(JSON.stringify(result.rows));
  };

  socket.onerror = (e) => console.log("socket errored:", e);
  socket.onclose = () => console.log("socket closed");

  return response;
});
