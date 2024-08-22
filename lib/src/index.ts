import { HtmlTags } from "./types/tags";

export type ArgType =
  | string
  | HTMLElement
  | Attributes
  | ((...args: any[]) => ArgType | ArgType[]);

type TagsType = Record<HtmlTags, TagType>;
type TagType = (...args: ArgType[]) => HTMLElement;

type Attributes = Record<string, any>;

type Tracker = {
  L: number[];
  p: HTMLElement;
};

// this may be unnecessary now. need to test with complex sets of components
function toFlatArray<T>(arr: T | T[]): T[] {
  return (Array.isArray(arr) ? arr : [arr]).flat(Infinity) as T[];
}

// append children to the parent element, recursively if needed
// TODO: does this work for empty components under components?
function appendAt(
  tracker: Tracker,
  target: ChildNode | null,
  ...children: (ArgType | ArgType[])[]
) {
  children = toFlatArray(children);
  const parent = tracker.p;

  const handledChildren: HTMLElement[] = [];

  for (const child of children) {
    if (typeof child === "string") {
      const textNode = document.createTextNode(child);
      parent.insertBefore(textNode, target);
    } else if (child instanceof HTMLElement) {
      try {
        parent.insertBefore(child, target);
      } catch (e) {
        console.log("error", e);
        console.log("child", child);
        console.log("parent", parent);
      }
      handledChildren.push(child);
    } else if (typeof child === "function") {
      const ret = toFlatArray((child as any).apply(tracker));
      handledChildren.push(...appendAt(tracker, target, ret));
    } else {
      for (const [key, value] of Object.entries(child)) {
        if (value === undefined) continue;
        if (key.startsWith("on")) {
          parent.addEventListener(key.slice(2), value);
        } else {
          parent.setAttribute(key, value);
        }
      }
    }
  }

  return handledChildren;
}

type TagArgs = [Attributes, ...ArgType[]] | ArgType[];

const tags = new Proxy({} as TagsType, {
  get(_, prop: HtmlTags) {
    return (...args: TagArgs) => {
      // tracker keeps position of all components under an element
      // TODO: does this work for empty components under components?
      const tracker = { p: document.createElement(prop), L: [] };
      appendAt(tracker, null, ...args);
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

  function updateComponent(this: Tracker | void, ...args: any[]) {
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

    // insert new children using appendAt and track them
    let target = p.childNodes[L[trackerIndex]];
    children = appendAt(tracker as Tracker, target, ...newChildren);

    // update tracker indices
    for (let i = trackerIndex + 1; i < L.length; i++)
      L[i] += children.length - newChildren.length;

    return children;
  }

  const setState = (newState: T) => {
    state = newState;
    updateComponent();
  };
  return [setState, updateComponent] as const;
}

// (window as any).scooter = { tags, createComponent };
export { tags, createComponent };
