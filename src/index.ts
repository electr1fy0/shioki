import { Redis } from "@upstash/redis/cloudflare";
import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
  BOT_TOKEN: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  CHAT_ID: string;
};
const app = new Hono<{ Bindings: Bindings }>();
app.get("/cron/morning", async (c) => {
  const redis = Redis.fromEnv(c.env);
  const today = new Date().toISOString().split("T")[0];
  console.log(today);

  const alreadySent = await redis.get(`morning_sent:${today}`);
  if (alreadySent) return c.json({ ok: true });

  await handleMessage(
    c.env.BOT_TOKEN,
    c.env.CHAT_ID,
    "gm. what are you working on today?",
  );

  await redis.set(`state:${c.env.CHAT_ID}`, "AWAITING_MORNING", { ex: 7200 });
  return c.json({ ok: true });
});
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/cron/evening", async (c) => {
  const redis = Redis.fromEnv(c.env);
  const today = new Date().toISOString().split("T")[0];

  const alreadySent = await redis.get(`evening_sent:${today}`);
  if (alreadySent) return c.json({ ok: true });

  await handleMessage(
    c.env.BOT_TOKEN,
    c.env.CHAT_ID,
    "what did you get done today?",
  );
  await redis.set(`state:${c.env.CHAT_ID}`, "AWAITING_EVENING", { ex: 7200 });
  await redis.set(`evening_sent:${today}`, "1", { ex: 86400 });

  return c.json({ ok: true });
});

app.get("/meow", async (c) => {
  const { results } = await c.env.DB.prepare("select * from meow").all();
  return c.json(results);
});

app.post("/webhook", async (c) => {
  const body = await c.req.json();
  const message = body?.message;
  const text = message.text;
  const chatId = message.chat.id.toString() ?? "";

  await handleMessage(
    c.env.BOT_TOKEN,
    chatId,
    `hi ${message.chat.first_name}, ${text}`,
  );
  return c.text("ok");
});
async function handleMessage(token: string, chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}
export default app;
