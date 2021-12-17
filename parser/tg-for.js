import * as parse5 from '../parse5.js'
import { tgBindTree } from './tg-bind.js'
import { applyTagelToElement } from './tagel-parser.js'
import { evaluate } from '../utils.js'

export async function tgFor(el, tgContext) {
  const expression = el.attribs['tg-for']
  const limit = isNaN(el.attribs['tg-for-limit']) ? -1 : Number(el.attribs['tg-for-limit'])
  if (!expression) return
  const value = evaluate(expression, tgContext)
  if (!Array.isArray(value)) {
    tgContext.$tagel.errors.push(`[tg-for] expression "${expression}" does not evaluate to array`)
    return
  }
  if (limit !== -1) value = value.slice(0, limit)
  delete el.attribs['tg-for']
  delete el.attribs['tg-for-limit']
  let lastEl = el
  for (const [$index, $item] of value.entries()) {
    const itemTemplate = parse5.clone(el)
    // itemTemplate.attribs['check'] = String($index)
    // console.debug({$item,tgContext})
    Object.assign($item, { $tagel: { ...tgContext.$tagel } })
    await tgBindTree(itemTemplate, $item)
    // console.debug(parse5.serialize(itemTemplate))
    await applyTagelToElement(itemTemplate, $item, { recursive: true })
    // await tgBindDoc(itemTemplate, $item, errors)
    parse5.insertAfter(itemTemplate, lastEl)
    lastEl = itemTemplate
  }
  parse5.remove(el)
}


export async function tgForDoc(doc, tgContext) {
  if (!tgContext) return
  const els = parse5.qsa(doc, el => el.attribs && 'tg-for' in el.attribs)
  await Promise.all(
    els.map(el => tgFor(el, tgContext))
  )
}
