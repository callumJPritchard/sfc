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
    const res = render(state);
    const newChildren = Array.isArray(res) ? res : [res];

    // replace each child with the new child
    for (let i = 0; i < Math.min(children.length, newChildren.length); i++) {
      const child = children[i];
      const newChild = newChildren[i];
      if (child !== newChild) {
        child.replaceWith(newChild);
        children[i] = newChild;
      }
    }
    children = newChildren;
    return children;
  }

  const setState = (newState: T) => {
    state = newState;
    rerender();
  };
  return [setState, rerender] as const;
}

/////////////////////////////////////////////////////////////////////////
////////////////////   app definition   /////////////////////////////////
/////////////////////////////////////////////////////////////////////////

const { div, h1, p, button } = tags;

function countcomponent() {
  const [setCount, renderCount] = createComponent<number>(0, (count) => {
    const ps = [];
    for (let i = 0; i < count; i++) {
      ps.push(p(i + ""));
    }

    return [
      button({ onclick: () => setCount(count + 1) }, `Count: ${count}`),
      p(count + ""),
      ...ps,
    ];
  });

  return renderCount();
}

const [, app] = createComponent({}, () => {
  return div(
    h1("Hello"),
    p("World"),
    countcomponent(),
    p("helooooo"),
    countcomponent()
  );
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
