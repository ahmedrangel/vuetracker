import { createServer } from "node:http";
import { loadEnvFile } from "node:process";
import { createServerAdapter } from "@whatwg-node/server";
import { AutoRouter } from "itty-router";
import { analyze } from "vuetracker-analyzer";

loadEnvFile();
const router = AutoRouter();

router.get("/analyze?", async (req) => {
  const { url } = req.query;
  return await analyze(url, {
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 VueTracker/1.0 (Debian GNU/Linux 12; arm64; +vuetracker.nuxt.dev)",
    executablePath: process.env.NUXT_ANALYZER_PROXY_OS === "windows" ? undefined : "/usr/bin/chromium-browser"
  }).catch((e) => {
    return Response.json({ success: false, error: { message: e.message, cause: e.cause } }, { status: 500 });
  });
});

router.all("*", () =>
  Response.json({ success: false, error: "Route not found" }, { status: 404 })
);

const ittyServer = createServerAdapter(router.fetch);
const httpServer = createServer(ittyServer);
httpServer.listen(2082);
console.info("Server running on http://localhost:2082");
