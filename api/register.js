const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const compact = (value = "", limit = 300) => String(value).trim().slice(0, limit);

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = process.env.BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return response.status(500).json({ ok: false, error: "Telegram is not configured" });
  }

  const body = request.body || {};
  const team = compact(body.team, 80);
  const captain = compact(body.captain, 80);
  const telegram = compact(body.telegram, 80);
  const members = compact(body.members, 2);
  const comment = compact(body.comment, 300);

  if (!team || !captain || !telegram || !members) {
    return response.status(400).json({ ok: false, error: "Missing required fields" });
  }

  const text = [
    "<b>Новая заявка Ла-Молл</b>",
    `Команда: ${escapeHtml(team)}`,
    `Капитан: ${escapeHtml(captain)}`,
    `Telegram: ${escapeHtml(telegram)}`,
    `Участников: ${escapeHtml(members)}`,
    comment ? `Комментарий: ${escapeHtml(comment)}` : null,
  ].filter(Boolean).join("\n");

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!telegramResponse.ok) {
    return response.status(502).json({ ok: false, error: "Telegram request failed" });
  }

  return response.status(200).json({ ok: true });
}
