import { Funcs } from "./types"

const { html, body, div, h1, h2, p, button } = Funcs

function ComponentExample() {
    return div(
        h1("Hello, component world!"),
        p("This is a component paragraph."),
        button("Click me!")
    )
}

const app =
    html(
        body(
            div(
                {id: "something"},
                h1("Hello, world!"),
                p("This is a paragraph.")
            ),
            div(
                h2("Another div."),
                p("This is another paragraph.")
            ),
            ComponentExample()
        )
    )


console.log(app)