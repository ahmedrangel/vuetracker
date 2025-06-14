import { createServer } from "node:http";
import { loadEnvFile } from "node:process";
import { createServerAdapter } from "@whatwg-node/server";
import { AutoRouter } from "itty-router";
import { analyze } from "vuetracker-analyzer";
import { $fetch } from "ofetch";

loadEnvFile();
const router = AutoRouter();

const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 VueTracker/1.0 (Debian GNU/Linux 12; arm64; +vuetracker.pages.dev)";

router.get("/analyze?", async (req) => {
  const { url } = req.query;
  return await analyze(url, {
    userAgent,
    executablePath: process.env.NUXT_ANALYZER_PROXY_OS === "windows" ? undefined : "/usr/bin/chromium"
  }).catch((e) => {
    return Response.json({ success: false, error: { message: e.message, cause: e.cause } }, { status: 500 });
  });
});

router.get("/redirection?", async (req) => {
  const { url } = req.query;
  if (!url) {
    return Response.json({ success: false, error: "URL is required" }, { status: 400 });
  }
  const response = await $fetch.raw(url, {
    headers: {
      "User-Agent": userAgent,
      "Accept-Language": "en-US,en;q=0.9",
      "X-Forwarded-For": "23.45.67.89"
    }
  });
  return { success: true, url: response.url };
});

router.all("*", () =>
  Response.json({ success: false, error: "Route not found" }, { status: 404 })
);

const ittyServer = createServerAdapter(router.fetch);
const httpServer = createServer(ittyServer);
httpServer.listen(2082);
console.info("Server running on http://localhost:2082");
