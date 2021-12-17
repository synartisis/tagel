import * as parse5 from '../parse5.js'
import { evaluate } from '../utils.js'


export async function tgIf(el, tgContext) {
  if (!el || !tgContext) return
  const expression = el.attribs['tg-if']
  if (!expression) return
  const value = evaluate(expression, tgContext)
  delete el.attribs['tg-if']
  if (!value) parse5.remove(el)
}


export async function tgIfDoc(doc, tgContext) {
  if (!tgContext) return
  const els = parse5.qsa(doc, el => el.attribs && 'tg-if' in el.attribs)
  await Promise.all(
    els.map(el => tgIf(el, tgContext))
  )
}
