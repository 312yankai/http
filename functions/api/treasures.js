/**
 * GET  /api/treasures  → 返回未过期的宝藏点（并顺手清掉已过期的）
 * POST /api/treasures  → 新增一条（需要 X-Token 与 env.WRITE_TOKEN 匹配）
 */
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const nowSec = () => Math.floor(Date.now() / 1000);

export async function onRequestGet({ env }) {
  try {
    const now = nowSec();
    // 惰性销毁：过期的直接物理删除，不留残值
    await env.DB.prepare("DELETE FROM treasures WHERE ends_at <= ?").bind(now).run();
    const { results } = await env.DB
      .prepare("SELECT id, name, x, y, ends_at, note FROM treasures ORDER BY ends_at ASC")
      .all();
    return json({ now, items: results || [] });
  } catch (e) {
    return json({ error: "db error", detail: String(e) }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  const token = request.headers.get("x-token") || "";
  if (!env.WRITE_TOKEN || token !== env.WRITE_TOKEN) {
    return json({ error: "unauthorized" }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const name = String(body.name || "").trim().slice(0, 60);
  const endsAt = Math.floor(Number(body.ends_at));
  const now = nowSec();

  if (!name) return json({ error: "地点名称必填" }, 400);
  if (!Number.isFinite(endsAt) || endsAt <= now) {
    return json({ error: "结束时间必须晚于当前时间" }, 400);
  }

  const toInt = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  };
  const x = toInt(body.x);
  const y = toInt(body.y);
  const note = String(body.note || "").trim().slice(0, 200);

  try {
    const r = await env.DB.prepare(
      "INSERT INTO treasures(name,x,y,ends_at,note,created_at) VALUES(?,?,?,?,?,?)"
    )
      .bind(name, x, y, endsAt, note, now)
      .run();
    return json({ ok: true, id: r.meta && r.meta.last_row_id }, 201);
  } catch (e) {
    return json({ error: "db error", detail: String(e) }, 500);
  }
}
