import { SITE } from "../app/utils/site";

export default defineNuxtConfig({

  modules: [
    "@nuxt/ui",
    "@nuxt/eslint",
    "@nuxtjs/sitemap",
    "@nuxthub/core",
    "nuxt-ripple"
  ],

  $production: {
    nitro: {
      preset: "cloudflare-pages"
    }
  },

  devtools: { enabled: true },

  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      htmlAttrs: {
        lang: "en"
      },
      link: [
        { rel: "apple-touch-icon", sizes: "180x180", href: "/images/apple-touch-icon.png" },
        { rel: "icon", type: "image/png", sizes: "96x96", href: "/images/favicon-96x96.png" },
        { rel: "icon", type: "image/svg+xml", href: "/images/favicon.svg" },
        { rel: "manifest", href: "/site.webmanifest" }
      ],
      meta: [
        { name: "robots", content: "index, follow" },
        { property: "og:site_name", content: SITE.name },
        { name: "google-site-verification", content: "-wH8J1lsOCA1vhveMd1oet1kJcje51W6XAFhvDRsxS0" }
      ]
    }
  },

  css: [
    "~/assets/css/main.css",
    "~/assets/scss/app.scss"
  ],

  site: { url: SITE.url },

  colorMode: {
    preference: "light",
    fallback: "light"
  },

  runtimeConfig: {
    analyzer: {
      proxyURL: process.env.NUXT_ANALYZER_PROXY_URL
    }
  },

  routeRules: {
    "/": {}
  },

  features: {
    inlineStyles: false
  },

  experimental: {
    typedPages: true,
    viewTransition: true
  },
  compatibilityDate: "2025-07-18",

  nitro: {
    prerender: {
      autoSubfolderIndex: false,
      crawlLinks: false
    },
    cloudflare: {
      pages: {
        routes: {
          exclude: ["/images/*", "/icons/*"]
        }
      },
      nodeCompat: true
    },
    experimental: {
      tasks: true
    }
  },

  hub: {
    cache: {
      namespaceId: "597740bcf7904251b5f3964ef8577e0a",
      binding: "CACHE"
    },
    db: {
      dialect: "sqlite",
      casing: "snake_case",
      connection: { databaseId: "b2e68ee0-ec60-48e1-9d52-99b516e35f74" }
    }
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["mixed-decls", "color-functions", "import", "global-builtin"]
        }
      }
    }
  },

  eslint: {
    config: {
      autoInit: false,
      stylistic: true
    }
  },

  icon: {
    mode: "svg",
    clientBundle: { scan: true, sizeLimitKb: 2048 },
    customCollections: [
      { prefix: "vuetracker", dir: "./node_modules/vuetracker-analyzer/dist/icons" }
    ]
  },

  sitemap: {
    discoverImages: false,
    sources: ["/api/__sitemap"],
    urls: [
      { loc: "/", priority: 1, lastmod: new Date().toISOString() }
    ],
    defaults: { priority: 0.8, lastmod: new Date().toISOString() },
    xslColumns: [
      { label: "URL", width: "65%" },
      { label: "Priority", select: "sitemap:priority", width: "12.5%" },
      { label: "Last Modified", select: "sitemap:lastmod", width: "35%" }
    ]
  }
});
