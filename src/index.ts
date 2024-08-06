import { nextTick } from "process";
import { FuncsType, ComponentType, ArgType } from "./types";

const tags = new Proxy({} as FuncsType, {
  get(target, prop) {
    const ret: ComponentType = (...args: ArgType[]) => {
      console.log(this);
      const dom = document.createElement(prop as string);
      for (const arg of args) {
        if (typeof arg === "string") {
          dom.appendChild(document.createTextNode(arg));
        }
        if (arg instanceof HTMLElement) {
          dom.appendChild(arg);
        }
        if (typeof arg === "object" && !Array.isArray(arg)) {
          for (const [key, value] of Object.entries(arg)) {
            if (key.includes("on")) {
              dom.addEventListener(
                key.replace("on", ""),
                value as EventListener
              );
            } else {
              dom.setAttribute(key, value as string);
            }
          }
        }
      }
      return dom;
    };
    return ret;
  },
});

function FFF() {
  let app: (() => HTMLElement) | undefined;
  let root: HTMLElement | undefined;

  function mount(newApp: () => HTMLElement, el: string) {
    app = newApp;
    root = document.getElementById(el)!;

    root.appendChild(app());
  }

  function useState<T>(initial: T) {
    let state = initial;
    console.log("setting up state", state);
    function setState(newState: T) {
      console.log(newState);
      state = newState;
      if (root && app) {
        console.log("re-rendered");

        root!.innerHTML = "";
        root!.appendChild(app());
      }
    }

    return [state, setState] as const;
  }

  return {
    tags,
    mount,
    useState,
  };
}

export default FFF();
