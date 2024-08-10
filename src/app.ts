import { HtmlTags } from "./types/tags";

export type ArgType = string | Attributes | HTMLElement;

export type TagType = (...args: ArgType[]) => HTMLElement;

export interface Attributes {
  [key: string]: any;
}

export type FuncsType = Record<HtmlTags, TagType>;

function stateComponent<T>(
  initialState: T,
  renderFunc: (state: T) => HTMLElement
) {
  let renderFn = () => {};

  const state = new Proxy(
    { value: initialState },
    {
      set(target, prop, value) {
        if (prop === "value") {
          target.value = value;
          renderFn();
        }
        return true;
      },
    }
  );

  renderFn = () => {
    const element = renderFunc(state.value);
    const container = document.getElementById("state-container");
    if (container) {
      container.innerHTML = ""; // Clear the container
      container.appendChild(element);
    }
  };

  return [state, () => renderFunc(state.value)] as [
    typeof state,
    () => HTMLElement
  ];
}

function tagProxy() {
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
  return typeof arg === "object" && arg !== null && !Array.isArray(arg);
}

function appendChildren(element: HTMLElement, children: ArgType[]) {
  children.forEach((child) => {
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      element.appendChild(child);
    }
  });
}

const FFF = tagProxy();
const { div, h1, h2, p, button } = FFF.tags;

function app() {
  const [count, countState] = stateComponent(0, (state) => {
    return p(`Counter: ${state}`);
  });

  function inc() {
    count.value++;
  }

  return div(
    { id: "main-div", class: "container" },
    div({ id: "header" }, h1("Hello, world!"), p("This is a paragraph.")),
    div({ id: "content" }, h2("Another div."), p("This is another paragraph.")),
    button({ onClick: inc }, "Click me"),
    div({ id: "state-container" }, countState())
  );
}

function render() {
  document.body.innerHTML = ""; // Clear the body content

  const appElement = app();
  document.body.appendChild(appElement);
}

render();
