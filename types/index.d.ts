import type { ErrorCode } from "~~/server/utils/errors";

export {};

declare global {
  type ErrorCode = typeof ErrorCode;

  interface GeneralTechnolgyInfo {
    imgPath?: string;
    name: string;
    slug: string;
  }

  interface Framework extends GeneralTechnolgyInfo {
    version: string;
  }

  interface Meta {
    description: string;
    icons?: {
      url: sring;
      sizes: string;
    }[];
    isAdultContent: false;
    language: string;
    siteName: string;
    title: string;
  }

  interface VueTrackerResponse {
    domain: string;
    framework?: Framework;
    frameworkModules?: GeneralTechnolgyInfo[];
    hasSSR: boolean;
    hostname: string;
    isStatic: boolean;
    meta?: Meta;
    plugins?: GeneralTechnolgyInfo[];
    ui?: GeneralTechnolgyInfo;
    url: string;
    vueVersion?: string;
  }
}
