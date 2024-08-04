import { Funcs } from "./types"

const { html, body, div, h1, h2, p } = Funcs

const app =
    html(
        body(
            div(
                h1("Hello, world!"),
                p("This is a paragraph.")
            ),
            div(
                h2("Another div."),
                p("This is another paragraph.")
            )
        )
    )


console.log(app)