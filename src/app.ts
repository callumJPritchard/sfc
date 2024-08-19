import { HtmlTags } from "./types/tags";

type ArgType = string | HTMLElement | Record<string, any>;

type TagsType = Record<HtmlTags, TagType>;
type TagType = (...args: ArgType[]) => HTMLElement;

type Tracker = {
  positionList: number[];
  parent: HTMLElement;
};

function toFlatArray<T>(arr: T | T[]): T[] {
  return (Array.isArray(arr) ? arr : [arr]).flat(Infinity) as T[];
}

function appendChildren(
  tracker: Tracker,
  ...children: (ArgType | ArgType[])[]
) {
  children = toFlatArray(children);
  const parent = tracker.parent;

  for (const child of children) {
    if (typeof child === "string") {
      parent.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      parent.appendChild(child);
    } else if (typeof child === "function") {
      const ret = toFlatArray(child.apply(tracker));
      appendChildren(tracker, ret);
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
      const tracker = {
        positionList: [],
        parent: document.createElement(prop),
      };
      appendChildren(tracker, ...args);
      return tracker.parent;
    };
  },
});

function createComponent<T>(
  initial: T,
  render: (state: T) => ArgType | ArgType[]
) {
  let state = initial;
  let children: HTMLElement[] = [];
  let tracker: Tracker | void;
  let trackerIndex = 0;

  function rerender(this: Tracker | void, ...args: any[]) {
    if (this) {
      tracker = this;
      // register where the first child should be placed
      trackerIndex = tracker.positionList.length;
      tracker.positionList.push(tracker.parent.childNodes.length);
    }
    if (!tracker) {
      throw new Error("Tracker is not defined");
    }

    const res = render(state);
    const newChildren: HTMLElement[] = toFlatArray(res) as HTMLElement[];

    // remove old children
    for (const child of children) {
      child.remove();
    }

    // insert new children
    let target = tracker.parent.childNodes[tracker.positionList[trackerIndex]];
    for (let i = newChildren.length - 1; i >= 0; i--) {
      target = tracker.parent.insertBefore(newChildren[i], target);
    }

    // update tracker indices
    const diff = newChildren.length - children.length;
    for (let i = trackerIndex + 1; i < tracker.positionList.length; i++) {
      tracker.positionList[i] += diff;
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
  const parent = document.getElementById(id);
  if (parent) {
    appendChildren(
      {
        parent,
        positionList: [],
      },
      element
    );
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
