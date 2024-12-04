import { SITE } from "../app/utils/site";

export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },
  compatibilityDate: "2024-11-27",

  app: {
    pageTransition: { name: "fade", mode: "out-in" },
    layoutTransition: { name: "fade", mode: "out-in" },
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: "",
      htmlAttrs: {
        lang: "en"
      },
      link: [],
      meta: [
        { name: "robots", content: "index, follow" },
        { property: "og:site:name", content: SITE.name }
      ]
    }
  },

  css: [
    "~/assets/scss/app.scss"
  ],

  modules: [
    "@nuxt/ui",
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxtjs/color-mode",
    "@nuxtjs/sitemap",
    "@nuxthub/core",
    "nuxt-ripple"
  ],

  icon: {
    mode: "svg",
    clientBundle: { scan: true, sizeLimitKb: 2048 },
    customCollections: [
      { prefix: "vuetracker", dir: "./public/icons" }
    ]
  },

  eslint: {
    config: {
      autoInit: false,
      stylistic: true
    }
  },

  runtimeConfig: {
    analyzer: {
      proxyURL: process.env.NUXT_ANALYZER_PROXY_URL
    }
  },

  colorMode: {
    preference: "light",
    fallback: "light"
  },

  site: { url: SITE.url },

  nitro: {
    prerender: {
      autoSubfolderIndex: false,
      crawlLinks: false,
      routes: ["/sitemap.xml"]
    },
    cloudflare: {
      pages: {
        routes: {
          exclude: ["/images/*", "/icons/*"]
        }
      }
    },
    experimental: {
      tasks: true
    }
  },

  sitemap: {
    discoverImages: false,
    xslColumns: [
      { label: "URL", width: "65%" },
      { label: "Priority", select: "sitemap:priority", width: "12.5%" },
      { label: "Last Modified", select: "sitemap:lastmod", width: "35%" }
    ]
  },

  routeRules: {
    "/": { sitemap: { priority: 1 } },
    "/*/**": { sitemap: { priority: 0.8, lastmod: new Date().toISOString() } }
  },

  features: {
    inlineStyles: false
  },

  experimental: {
    typedPages: true
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          silenceDeprecations: ["mixed-decls", "color-functions", "import", "global-builtin"]
        }
      }
    }
  },

  tailwindcss: {
    configPath: ".config/tailwind"
  },

  hub: {
    cache: true,
    database: true
  }
});
