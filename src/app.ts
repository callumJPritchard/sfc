import { HtmlTags } from "./types/tags";

type ArgType = string | HTMLElement | Record<string, any>;

type TagsType = Record<HtmlTags, TagType>;
type TagType = (...args: ArgType[]) => HTMLElement;

type Tracker = {
  pL: number[];
  p: HTMLElement;
};

const d = document;

function toFlatArray<T>(arr: T | T[]): T[] {
  return (Array.isArray(arr) ? arr : [arr]).flat(Infinity) as T[];
}

function appendChildren(
  tracker: Tracker,
  ...children: (ArgType | ArgType[])[]
) {
  children = toFlatArray(children);
  const parent = tracker.p;

  for (const child of children) {
    if (typeof child === "string") {
      parent.appendChild(d.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      parent.appendChild(child);
    } else if (typeof child === "function") {
      const ret = toFlatArray(child.apply(tracker));
      appendChildren(tracker, ret);
    } else {
      for (const [key, value] of Object.entries(child)) {
        if (value === undefined) continue;
        if (key.startsWith("on")) {
          parent.addEventListener(key.slice(2), value);
        } else parent.setAttribute(key, value);
      }
    }
  }
}

const tags = new Proxy({} as TagsType, {
  get(_, prop: HtmlTags) {
    return (...args: (ArgType | ArgType[])[]) => {
      const tracker = { p: d.createElement(prop), pL: [] };
      appendChildren(tracker, ...args);
      return tracker.p;
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
      trackerIndex = tracker.pL.length;
      tracker.pL.push(tracker.p.childNodes.length);
    }

    const { p, pL } = tracker as Tracker;

    const res = render(state);
    const newChildren: HTMLElement[] = toFlatArray(res) as HTMLElement[];

    // remove old children
    children.forEach((c) => c.remove());

    // insert new children
    let target = p.childNodes[pL[trackerIndex]];
    for (let i = newChildren.length - 1; i >= 0; i--) {
      target = p.insertBefore(newChildren[i], target);
    }

    // update tracker indices
    for (let i = trackerIndex + 1; i < pL.length; i++)
      pL[i] += newChildren.length - children.length;

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
  d.body.appendChild(app);
};
