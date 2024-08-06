import { HtmlTags } from "./tags";

export type ArgType =
  | string
  | Record<string, string | ((...args: any) => any)>
  | HTMLElement;

export type ComponentType = (...args: ArgType[]) => HTMLElement;

export type FuncsType = Record<HtmlTags, ComponentType>;
