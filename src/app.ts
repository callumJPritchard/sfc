import FFF from "./index";

const { tags, mount, useState } = FFF;
const { div, h1, h2, p, button } = tags;

const [count, setCount] = useState(0);
function ComponentExample() {
  console.log("rendering component");
  return div(
    h1("Hello, component world!"),
    p(count + ""),
    button({ onclick: () => setCount(count + 1) }, "Click me!")
  );
}

const app = () =>
  div(
    div({ id: "something" }, h1("Hello, world!"), p("This is a paragraph.")),
    div(h2("Another div."), p("This is another paragraph.")),
    ComponentExample()
  );

mount(app, "app");
