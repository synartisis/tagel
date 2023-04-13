import * as html from "syn-html-parser"


declare global {

  namespace tagel {

    interface State {
      filename: string
      lang: string
      toDetach: Array<html.Element | html.TextNode>
    }

    interface ErrorEntry {
      instances: { element: html.Element | html.TextNode, errorId: string, content: string }[]
      expression: string
      message?: string
      error?: any
    }

  }

}