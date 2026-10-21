// Seed các giao diện mẫu trong thư mục samples/ vào Supabase (kèm thumbnail tự chụp).
// Chạy: npm run seed   (cần .env.local có SUPABASE_SERVICE_ROLE_KEY và CHROME_EXECUTABLE_PATH)
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import puppeteer from "puppeteer-core";

const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key, CHROME_EXECUTABLE_PATH: chrome } = process.env;
if (!url || !key) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local");
if (!chrome) throw new Error("Thiếu CHROME_EXECUTABLE_PATH (đường dẫn Chrome trên máy) trong .env.local");

const db = createClient(url, key, { auth: { persistSession: false } });
const catalog = JSON.parse(await readFile(new URL("../samples/catalog.json", import.meta.url), "utf8"));
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--no-sandbox"] });

async function capture(html) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setContent(html, { waitUntil: "load", timeout: 30000 }).catch(() => {});
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 }).catch(() => {});
  const height = Math.min(await page.evaluate(() => document.documentElement.scrollHeight), 5200);
  const shot = await page.screenshot({
    type: "jpeg",
    quality: 72,
    clip: { x: 0, y: 0, width: 1440, height },
    captureBeyondViewport: true,
  });
  await page.close();
  return Buffer.from(shot);
}

try {
  for (const { file, ...meta } of catalog) {
    const html = await readFile(new URL(`../samples/${file}`, import.meta.url), "utf8");
    const { data: row, error } = await db
      .from("templates")
      .upsert({ ...meta, demo_html: html, status: "published", updated_at: new Date().toISOString() }, { onConflict: "slug" })
      .select("id")
      .single();
    if (error) throw error;

    const sourcePath = `${row.id}/index.html`;
    const { error: srcErr } = await db.storage
      .from("sources")
      .upload(sourcePath, new Blob([html], { type: "text/html" }), { upsert: true, contentType: "text/html; charset=utf-8" });
    if (srcErr) throw srcErr;

    const thumbPath = `${row.id}/${Date.now()}.jpg`;
    const { error: upErr } = await db.storage
      .from("thumbnails")
      .upload(thumbPath, await capture(html), { contentType: "image/jpeg", cacheControl: "31536000" });
    if (upErr) throw upErr;
    const thumbnail_url = db.storage.from("thumbnails").getPublicUrl(thumbPath).data.publicUrl;

    await db.from("templates").update({ source_path: sourcePath, thumbnail_url }).eq("id", row.id);
    console.log("✓", meta.name);
  }
} finally {
  await browser.close();
}
