import { HtmlTags } from "./types/tags";

type ArgType = string | HTMLElement | Record<string, any>;

type TagsType = Record<HtmlTags, TagType>;
type TagType = (...args: ArgType[]) => HTMLElement;

type Tracker = {
  L: number[];
  p: HTMLElement;
};

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
          parent.addEventListener(key.slice(2), value);
        } else parent.setAttribute(key, value);
      }
    }
  }
}

const tags = new Proxy({} as TagsType, {
  get(_, prop: HtmlTags) {
    return (...args: (ArgType | ArgType[])[]) => {
      const tracker = { p: document.createElement(prop), L: [] };
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
      trackerIndex = tracker.L.length;
      tracker.L.push(tracker.p.childNodes.length);
    }

    const { p, L } = tracker as Tracker;

    const res = render(state);
    const newChildren: HTMLElement[] = toFlatArray(res) as HTMLElement[];

    // remove old children
    children.forEach((c) => c.remove());

    // insert new children
    let target = p.childNodes[L[trackerIndex]];
    for (let i = newChildren.length - 1; i >= 0; i--)
      target = p.insertBefore(newChildren[i], target);

    // update tracker indices
    for (let i = trackerIndex + 1; i < L.length; i++)
      L[i] += newChildren.length - children.length;

    children = newChildren;
    return children;
  }

  const setState = (newState: T) => {
    state = newState;
    rerender();
  };
  return [setState, rerender] as const;
}

(window as any).scooter = { tags, createComponent };
