import { HtmlTags } from "./types/tags";

export type ArgType = string | TagType | TreeNode | Attributes;

export type TagType = (...args: ArgType[]) => TreeNode;

export interface TreeNode {
  tag: string;
  attributes: Attributes;
  eventListeners: EventListeners;
  children: ArgType[];
}

export interface Attributes {
  [key: string]: any;
}

export interface EventListeners {
  [event: string]: Function;
}

export type FuncsType = Record<HtmlTags, TagType>;

function FFFProto() {
  const tags = new Proxy({} as FuncsType, {
    get(_, prop: string) {
      return (...args: ArgType[]) => {
        const node: TreeNode = {
          tag: prop,
          children: [],
          attributes: {},
          eventListeners: {},
        };
        if (isAttributes(args[0])) {
          const attributes = args[0] as Attributes;
          for (const key in attributes) {
            if (key.startsWith("on")) {
              node.eventListeners[key] = attributes[key];
            } else {
              node.attributes[key] = attributes[key];
            }
          }
          node.children = args.slice(1);
        } else {
          node.children = args;
        }
        return node;
      };
    },
  });

  return {
    tags,
  };
}

function isAttributes(arg: ArgType): arg is Attributes {
  return (
    typeof arg === "object" &&
    arg !== null &&
    !Array.isArray(arg) &&
    !("tag" in arg)
  );
}

const FFF = FFFProto();

const { tags } = FFF;
const { div, h1, h2, p, button } = tags;

const app = () =>
  div(
    { id: "main-div", class: "container" },
    div({ id: "header" }, h1("Hello, world!"), p("This is a paragraph.")),
    div({ id: "content" }, h2("Another div."), p("This is another paragraph.")),
    button({ onClick: () => alert("Button clicked!") }, "Click me")
  );

const tree = app();

console.log(tree);
