import type { ErrorCode } from "~~/server/utils/errors";

export {};

declare global {
  type ErrorCode = typeof ErrorCode;

  interface VueTrackerTechnology {
    slug: string;
    name: string;
    type: "framework" | "module" | "plugin" | "ui";
    version?: string | null;
  }

  interface VueTrackerSiteIcons {
    url?: sring | null;
    sizes?: string | null;
  }

  interface Meta {
    description?: string;
    icons?: VueTrackerSiteIcons[];
    isAdultContent: false;
    language?: string;
    siteName?: string;
    title?: string;
  }

  interface VueTrackerProxyResponse {
    url: string;
    domain: string;
    framework?: VueTrackerTechnology;
    frameworkModules?: VueTrackerTechnology[];
    hasSSR: number;
    hostname: string;
    meta: Meta;
    isAdultContent: number;
    isStatic: number;
    meta?: Meta;
    plugins?: VueTrackerTechnology[];
    ui?: VueTrackerTechnology | null;
    url: string;
    vueVersion: string;
  }

  interface VueTrackerResponse extends VueTrackerProxyResponse, Omit<meta, framework, frameworkModules, plugins, ui> {
    slug: string;
    icons: VueTrackerSiteIcons[];
    technologies: VueTrackerTechnology[];
    updatedAt: number;
    createdAt: number;
  }

  interface VueTrackerRawResponse extends VueTrackerResponse, Omit<icons, technologies> {
    icons: string;
    technologies: string;
  }
}
