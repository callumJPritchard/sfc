import { HtmlTags } from "./types/tags";

type TagType = (...args: ArgType[]) => HTMLElement;

type ArgType = string | HTMLElement | TagType | Record<string, any>;

type TagsType = Record<HtmlTags, TagType>;

function appendChildren(
  parent: HTMLElement,
  ...children: (ArgType | ArgType[])[]
) {
  children = children.flat(Infinity);
  for (const child of children) {
    if (typeof child === "string") {
      parent.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      parent.appendChild(child);
    } else if (typeof child === "function") {
      const ret = child();
      if (Array.isArray(ret)) {
        appendChildren(parent, ret);
      } else {
        parent.appendChild(ret);
      }
    } else {
      for (const [key, value] of Object.entries(child)) {
        if (key.startsWith("on")) {
          parent.addEventListener(key.slice(2).toLowerCase(), value);
        } else parent.setAttribute(key, value);
      }
    }
  }
}

const tags = new Proxy<TagsType>({} as TagsType, {
  get(target, prop: HtmlTags) {
    return (...args: (ArgType | ArgType[])[]) => {
      // args = args.flat(Infinity);
      console.log("prop", prop);
      console.log("args", args);

      const element = document.createElement(prop);
      appendChildren(element, ...args);
      return element;
    };
  },
});

function createComponent<T>(
  initial: T,
  render: (state: T) => ArgType | ArgType[]
) {
  let state = initial;
  let children: HTMLElement[] = [];

  function rerender() {
    let parent = children[0]?.parentElement;
    for (const child of children) {
      child.remove();
    }
    const res = render(state);
    children = Array.isArray(res) ? res : [res];

    if (parent) {
      appendChildren(parent, children);
    }

    return children;
  }

  const setState = (newState: T) => {
    console.log("newState", newState);
    state = newState;
    rerender();
  };
  return [setState, rerender] as const;
}

const { div, h1, p, button } = tags;

const [, app] = createComponent({}, () => {
  const [setCount, renderCount] = createComponent<number>(0, (count) => {
    return button({ onclick: () => setCount(count + 1) }, `Count: ${count}`);
  });

  return div(h1("Hello"), p("World"), renderCount);
});

function mount(id: string, element: HTMLElement[]) {
  const root = document.getElementById(id);
  if (root) {
    appendChildren(root, element);
  }
}

// on load, mount the app
window.onload = () => {
  mount("app", app());
};
