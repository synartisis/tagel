import * as html from "syn-html-parser"


declare global {

  namespace tagel {

    interface State {
      filename: string
      lang: string
      toDetach: Array<html.Element | html.TextNode>
    }

  }

}