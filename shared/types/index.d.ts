import type { CacheEntry as C } from "nitropack";
import type { ErrorCode } from "../../server/utils/errors";

export {};

declare global {
  type ErrorCode = typeof ErrorCode;
  type CacheEntry<T> = C<T> | undefined;
  interface VueTrackerTechnology {
    slug: string;
    name: string;
    type: "framework" | "module" | "plugin" | "ui" | "server";
    version?: string | null;
  }

  interface VueTrackerSiteIcons {
    url?: sring | null;
    sizes?: string | null;
  }

  interface Meta {
    description?: string | null;
    icons?: VueTrackerSiteIcons[];
    isAdultContent: boolean;
    language?: string;
    siteName?: string | null;
    title?: string;
    ogImage?: string | null;
  }

  interface VueTrackerProxyResponse {
    domain: string;
    framework?: VueTrackerTechnology;
    frameworkModules?: VueTrackerTechnology[];
    hasSSR: number;
    hostname: string;
    meta?: Meta;
    isAdultContent: number;
    isStatic: number;
    plugins?: VueTrackerTechnology[];
    ui?: VueTrackerTechnology | null;
    server?: VueTrackerTechnology;
    url: string;
    vueVersion: string;
  }

  interface VueTrackerResponse {
    slug: string;
    hostname: string;
    url: string;
    description?: string | null;
    icons?: VueTrackerSiteIcons[];
    isAdultContent: boolean;
    language?: string;
    siteName?: string | null;
    title?: string;
    ogImage?: string | null;
    technologies: VueTrackerTechnology[];
    isStatic?: number;
    hasSSR: number;
    vueVersion: string;
    updatedAt: number;
    createdAt: number;
  }
}
