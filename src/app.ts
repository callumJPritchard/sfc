import { HtmlTags } from "./types/tags";

type ArgType = string | HTMLElement | Record<string, any>;

type TagsType = Record<HtmlTags, TagType>;
type TagType = (...args: ArgType[]) => HTMLElement;

function toFlatArray<T>(arr: T | T[]): T[] {
  return (Array.isArray(arr) ? arr : [arr]).flat(Infinity) as T[];
}

function appendChildren(
  parent: HTMLElement,
  ...children: (ArgType | ArgType[])[]
) {
  children = children.flat(Infinity);

  const componentTracker = {
    egg: "egg",
    list: [],
  }

  for (const child of children) {
    if (typeof child === "string") {
      parent.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      parent.appendChild(child);
    } else if (typeof child === "function") {
      // console.log(child);
      const ret = toFlatArray(child.apply(componentTracker))
      appendChildren(parent, ret);
    } else {
      for (const [key, value] of Object.entries(child)) {
        if (value === undefined) continue;
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

  function rerender(this: any, ...args: any[]) {

    console.log(this)

    if (args) {
     console.log(args);
    }

    const res = render(state);
    const newChildren: HTMLElement[] = toFlatArray(res) as HTMLElement[];

    // replace the first child with the new children
    if (children[0]) {
      children[0].replaceWith(...newChildren);
    }
    // remove the rest of the children
    for (const child of children.slice(1)) {
      child.remove();
    }

    if (newChildren.length === 0) {
      newChildren.push(document.createElement("template"));
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

function mount(id: string, element: HTMLElement) {
  const root = document.getElementById(id);
  if (root) {
    appendChildren(root, element);
  }
}
/////////////////////////////////////////////////////////////////////////
////////////////////   app definition   /////////////////////////////////
/////////////////////////////////////////////////////////////////////////

const { div, h1, p, button } = tags;

function countcomponent() {
  const [setCount, renderCount] = createComponent<number>(0, (count) => {
    const ps = [];
    for (let i = 0; i <= count; i++) {
      ps.push(p(i + ""));
    }

    const attributes = {
      style: count % 2 === 0 ? "color: green" : undefined,
    };

    return [
      button(
        attributes,
        { onclick: () => setCount(count + 1) },
        `Count: ${count}`
      ),
      button({ onclick: () => setCount(count - 1) }, `reduce`),
      p(attributes, count + ""),
      ps,
    ];
  });

  return renderCount;
}

function forLoopExample(input: number) {
  const [setCount, renderCount] = createComponent<number>(input, (count) => {
    const ps = [];
    for (let i = 0; i < count; i++) {
      ps.push(p("count: " + i));
    }

    return ps;
  });

  return [setCount, renderCount] as const;
}

const [setCount, renderCount] = forLoopExample(0);

const app = div(
  h1("Hello"),
  p("World"),
  div(
    countcomponent,
    p("helooooo"),
    countcomponent,
    button({ onclick: () => setCount(10) }, "set count to 10"),
    renderCount
  )
);

// on load, mount the app
window.onload = () => {
  mount("app", app);
};
