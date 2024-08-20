import { tags } from "../../lib/src/index";
import { countcomponent } from "./components/counter";
import { forLoop } from "./components/forLoop";
import { pageLets } from "./components/pagelets";

const { div, h1, p, button } = tags;

const app = div(
  // attributes can be passed as an object
  {
    style: "background-color: #404040; color: rgb(151, 151, 151)",
  },
  h1("Hello"),
  p("World"),
  div(
    forLoop,
    p("sibling components will maintain position relative to components"),
    // components will be called as functions, they dont have to be called here
    countcomponent,
    p("I will also maintain position"),
    // components can be called with arguments if needed (here supplied a default value)
    countcomponent(7),
    pageLets(
      h1("Page 1"),
      h1("Page 2"),
      h1("Page 3"),
      //   countcomponent
      countcomponent(3),
      countcomponent(5),
      countcomponent(7)
    )
  )
);

// on load, mount the app
window.onload = () => {
  document.body.appendChild(app);
};
