import { tags, createComponent } from "../../../lib/src/index";

const { p, button } = tags;

export function countcomponent(initial: number = 0) {
  const [setCount, renderCount] = createComponent(initial, (count) => {
    const attributes = {
      style: count % 2 === 0 ? "color: green" : undefined,
    };

    return [
      button(
        attributes,
        { onclick: () => setCount(count + 1) },
        `Count: ${count}`
      ),
      // on<event> will add an event listener to the element for <event>
      button({ onclick: () => setCount(count - 1) }, `reduce`),
      p(attributes, count + ""),
    ];
  });

  // you can return just the render function
  return renderCount;
}
