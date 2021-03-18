import * as parse5 from '../parse5.js'
import { tgBindDoc } from './tg-bind.js'

export async function tgFor(el, tgContext, errors) {
  const property = el.attribs['tg-for']
  if (property in tgContext) {
    const value = tgContext[property]
    if (!Array.isArray(value)) {
      errors.push(`[tg-for] value for property "${property}" is not array`)
      return
    }
    delete el.attribs['tg-for']
    let lastEl = el
    for (const [$index, $item] of value.entries()) {
      // console.debug({$item, $index})
      const itemTemplate = parse5.clone(el)
      itemTemplate.attribs['check'] = String($index)
      await tgBindDoc(itemTemplate, $item, errors)
      parse5.insertAfter(itemTemplate, lastEl)
      lastEl = itemTemplate
    }
    parse5.remove(el)
  } else {
    errors.push(`[tg-for] value for property "${property}" not found`)
  }
}


export async function tgForDoc(doc, tgContext) {
  if (!tgContext) return
  const els = parse5.qsa(doc, el => el.attribs && 'tg-for' in el.attribs)
  await Promise.all(
    els.map(el => tgFor(el, tgContext))
  )
}
