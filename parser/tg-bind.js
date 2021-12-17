import * as parse5 from '../parse5.js'
import { evaluate } from '../utils.js'

const BIND_ATTRIBUTE_PREFIX = 'tg:'

export async function tgBind(el, tgContext) {
  if (!tgContext || !el.attribs) return
  // element content binding
  const source = el.attribs['tg-bind']
  if (source) {
    const value = evaluate(source, tgContext)
    if (value != null) {
      const fragment = parse5.parseFragment(String(value))
      while (el.children.length > 0) {
        parse5.remove(el.children[0])
      } 
      for (const child of fragment.children) {
        parse5.append(el, child)
      }
    }
  }
  // attributes binding
  for (const bindAttr of Object.keys(el.attribs).filter(o => o.startsWith(BIND_ATTRIBUTE_PREFIX))) {
    const attr = bindAttr.substring(BIND_ATTRIBUTE_PREFIX.length)
    const attrContent = el.attribs[bindAttr]
    const value = evaluate(attrContent, tgContext)
    if (value) {
      el.attribs[attr] = value
      delete el.attribs[bindAttr]
    }
  }
}


export async function tgBindTree(root, tgContext) {
  if (!tgContext) return
  const els = parse5.qsa(root, el => el.attribs)
  await Promise.all(
    els.map(el => tgBind(el, tgContext))
  )
}
