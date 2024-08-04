import { HtmlTags } from "./tags"

export type FuncsType = Record<HtmlTags, (...args: any[]) => string>

export const Funcs = new Proxy({} as FuncsType, {
    get(target, prop) {
        const p = String(prop)
        return (...args: any[]) => {
            return `<${p}>${args.join("")}</${p}>`
        }
    }
})