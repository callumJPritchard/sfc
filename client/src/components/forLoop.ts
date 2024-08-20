import { tags, createComponent } from "../../../lib/src/index";

const { p, button } = tags;

// a simple function for the outer component
export function forLoop() {
  // an inner function that creates a component
  function forLoopInner(input: number) {
    const [setCount, renderCount] = createComponent<number>(input, (count) => {
      const ps = [];
      for (let i = 0; i < count; i++) {
        ps.push(p("count: " + i));
      }

      return ps;
    });

    // in this case we return both the setCount and renderCount functions
    // this allows for the count to be set from outside the component
    return [setCount, renderCount];
  }

  const [setCount, renderCount] = forLoopInner(0);

  // you can return an array, or a single element
  return [
    // on<event> will add an event listener to the element for <event>
    button({ onclick: () => setCount(10) }, "set count to 10"),
    button({ onclick: () => setCount(0) }, "reset"),
    renderCount,
  ];
}
