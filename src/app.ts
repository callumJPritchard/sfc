import { HtmlTags } from "./types/tags";

export type ArgType = string | TagType | TreeNode | Attributes;

export type TagType = (...args: ArgType[]) => ExtendedHTMLElement;

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

class ExtendedHTMLElement extends HTMLElement {
  constructor(tagName: string) {
    super();
    this.attachShadow({ mode: "open" });
    const el = document.createElement(tagName);
    this.shadowRoot!.appendChild(el);
    return el;
  }
}

function FFFProto() {
  const tags = new Proxy({} as FuncsType, {
    get(_, prop: string) {
      return (...args: ArgType[]) => {
        const element = document.createElement(prop);

        if (isAttributes(args[0])) {
          const attributes = args[0] as Attributes;
          for (const key in attributes) {
            if (key.startsWith("on")) {
              const event = key.slice(2).toLowerCase();
              element.addEventListener(event, attributes[key]);
            } else {
              element.setAttribute(key, attributes[key]);
            }
          }
          appendChildren(element, args.slice(1));
        } else {
          appendChildren(element, args);
        }

        return element;
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

function appendChildren(element: HTMLElement, children: ArgType[]) {
  children.forEach((child) => {
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
    } else if (
      child instanceof ExtendedHTMLElement ||
      child instanceof HTMLElement
    ) {
      element.appendChild(child);
    }
  });
}

const FFF = FFFProto();

const { tags } = FFF;
const { div, h1, h2, p, button } = tags;

let cnt = 0;

function inc() {
  cnt++;
  console.log(cnt);
  render();
}

const app = () =>
  div(
    { id: "main-div", class: "container" },
    div({ id: "header" }, h1("Hello, world!"), p("This is a paragraph.")),
    div({ id: "content" }, h2("Another div."), p("This is another paragraph.")),
    button({ onClick: inc }, "Click me"),
    p(`Counter: ${cnt}`)
  );

function render() {
  const children = document.body.children;

  for (let i = children.length - 1; i >= 0; i--) {
    document.body.removeChild(children[i]);
  }

  document.body.appendChild(app());
}

render();
