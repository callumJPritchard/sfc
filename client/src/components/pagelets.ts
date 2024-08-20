import { tags, createComponent, ArgType } from "../../../lib/src/index";

const { p, button, form, input } = tags;

export function pageLets(...children: ArgType[]) {
  const [setSelected, renderPagelets] = createComponent<number>(
    0,
    (selected) => {
      return children[selected];
    }
  );

  const buttons = [];

  for (let i = 0; i < children.length; i++) {
    buttons.push(
      input(
        { type: "radio", name: "page", onclick: () => setSelected(i) },
        `Page ${i}`
      )
    );
  }

  return [...buttons, renderPagelets];
}
