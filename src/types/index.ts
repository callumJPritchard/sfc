import { HtmlTags } from "./tags"

type ArgType = string | Record<string, string> | undefined
type ComponentType = (...args: ArgType[]) => string

export type FuncsType = Record<HtmlTags, ComponentType>

export const Funcs = new Proxy({} as FuncsType, {
    get(target, prop) {
        const ret: ComponentType = (...args: ArgType[]) => {

            let attributes = "";
            let content = "";

            for (const arg of args) {
                if (typeof arg === "object" && !Array.isArray(arg)) {
                    for (const key in arg) {
                        attributes += ` ${key}="${arg[key]}"`;
                    }
                } else {
                    content += arg; // Concatenate content if it's not an object
                }
            }

            const start = `<${String(prop)}${attributes}>`;

            return `${start}${content}</${String(prop)}>`;
        }
        return ret;
    }
});
