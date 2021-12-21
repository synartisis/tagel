import treeAdapter from "parse5-htmlparser2-tree-adapter"

export function tagel(html: string, filename: string, context: object): string


declare global {
  namespace tagel {

    type Node = {
      type: string
    }

    type Element = Node & {
      name: string
      namespace: string
      ['x-attribsNamespace']: object
      ['x-attribsPrefix']: object
      children: Element[]
      attribs: object
      parent: Element
      prev: Element
      next: Element

      $context?: object
      $tagelError?: string
    }

  }
}

declare namespace treeAdapter {
  interface BaseNode {
    $tagelError: string
  }
}
