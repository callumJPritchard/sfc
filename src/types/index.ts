import { HtmlTags } from "./tags"

type ArgType = string | Record<string, string> | undefined
type ComponentType = (...args: ArgType[]) => string

export type FuncsType = Record<HtmlTags, ComponentType>

export const Funcs = new Proxy({} as FuncsType, {
    get(target, prop) {
        const ret: ComponentType = (...args: ArgType[]) => {

            let attributes = ""

            for (const arg of args) {
                if (typeof arg === "object" && !Array.isArray(arg)) {
                    for (const key in arg) {
                        attributes += ` ${key}="${arg[key]}"`; // Using += to accumulate the attributes string
                    }
                }
            }


            const start = `<${prop as string}${attributes}>`

            if (args.length === 0) {
                return `${start}</${prop as string}>`
            }


            return `${start}${args.join("")}</${prop as string}>`
        }
        return ret
    }
})