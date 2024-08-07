import { HtmlTags } from "./types/tags";

export type ArgType = string | TreeNode;

export type TagType = (...args: ArgType[]) => TreeNode;

export interface TreeNode {
  tag: string;
  children: ArgType[];
}

export type FuncsType = Record<HtmlTags, TagType>;

function FFFProto() {
  const tree: TreeNode[] = [];

  const tags = new Proxy({} as FuncsType, {
    get(_, prop: string) {
      return (...args: ArgType[]) => {
        const node: TreeNode = { tag: prop, children: args };
        console.log(node);
        tree.push(node);
        return node;
      };
    },
  });

  return {
    tags,
    tree,
  };
}

const FFF = FFFProto();

const { tags } = FFF;
const { div, h1, h2, p, button } = tags;

const app = () =>
  div(
    div(h1("Hello, world!"), p("This is a paragraph.")),
    div(h2("Another div."), p("This is another paragraph."))
  );

const tree = app();

console.log(JSON.stringify(tree, null, 2));
