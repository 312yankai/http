/**
 * DELETE /api/treasures/:id → 手动删除一条（需要 X-Token）
 */
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

export async function onRequestDelete({ params, request, env }) {
  const token = request.headers.get("x-token") || "";
  if (!env.WRITE_TOKEN || token !== env.WRITE_TOKEN) {
    return json({ error: "unauthorized" }, 401);
  }

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return json({ error: "invalid id" }, 400);
  }

  try {
    const r = await env.DB.prepare("DELETE FROM treasures WHERE id = ?").bind(id).run();
    return json({ ok: true, deleted: (r.meta && r.meta.changes) || 0 });
  } catch (e) {
    return json({ error: "db error", detail: String(e) }, 500);
  }
}
