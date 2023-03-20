export async function tagel(html: string, filename: string, context: object): string
export * as htmlParser from './html-parser.js'


declare global {
  namespace tagel {

    type NodeTypes = 'tag' | 'text' | 'directive' | 'root' | 'script'
    
    interface Node {
      type: string
      name: string
      namespace?: string
      attribs?: Attribs
      'x-attribsNamespace'?: {}
      'x-attribsPrefix'?: {}
      children?: Node[]
      data?: string
      parent: tagel.Node | null
      prev: tagel.Node | null
      next: tagel.Node | null
      $context?: object
      $tagelError?: string
    }

    type Predicate = (el: Node) => boolean

    interface Attribs {
      id?: string
      style?: string
      [key: string]: string
    }

  }
}
