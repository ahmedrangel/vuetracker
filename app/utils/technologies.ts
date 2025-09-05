import f from "vuetracker-analyzer/detectors/frameworks" with { type: "json" };
import m from "vuetracker-analyzer/detectors/nuxt.modules" with { type: "json" };
import p from "vuetracker-analyzer/detectors/plugins" with { type: "json" };
import u from "vuetracker-analyzer/detectors/uis" with { type: "json" };
import v from "vuetracker-analyzer/detectors/vue" with { type: "json" };
import s from "vuetracker-analyzer/detectors/servers" with { type: "json" };

export const frameworks = f;
export const modules = m;
export const plugins = p;
export const uis = u;
export const vue = v.metas;
export const servers = s;
