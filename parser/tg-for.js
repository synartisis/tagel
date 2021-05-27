import * as parse5 from '../parse5.js'
import { tgBindTree } from './tg-bind.js'
import { applyTagelToElement } from './tagel-parser.js'

export async function tgFor(el, tgContext) {
  const property = el.attribs['tg-for']
  const limit = isNaN(el.attribs['tg-for-limit']) ? -1 : Number(el.attribs['tg-for-limit'])
  if (property in tgContext) {
    let value = tgContext[property]
    if (!Array.isArray(value)) {
      tgContext.$tagel.errors.push(`[tg-for] value for property "${property}" is not array`)
      return
    }
    if (limit !== -1) value = value.slice(0, limit)
    delete el.attribs['tg-for']
    delete el.attribs['tg-for-limit']
    let lastEl = el
    for (const [$index, $item] of value.entries()) {
      const itemTemplate = parse5.clone(el)
      // itemTemplate.attribs['check'] = String($index)
      // console.debug(tgContext)
      Object.assign($item, { $tagel: { ...tgContext.$tagel } })
      await tgBindTree(itemTemplate, $item)
      // console.debug(parse5.serialize(itemTemplate))
      await applyTagelToElement(itemTemplate, $item, { recursive: true })
      // await tgBindDoc(itemTemplate, $item, errors)
      parse5.insertAfter(itemTemplate, lastEl)
      lastEl = itemTemplate
    }
    // tgContext.$tagel.toRemove.push(el)
    // setTimeout(() => parse5.remove(el))
    parse5.remove(el)
    // el.attribs.style = 'display: none;'
  } else {
    tgContext.$tagel.errors.push(`[tg-for] value for property "${property}" not found`)
  }
}


export async function tgForDoc(doc, tgContext) {
  if (!tgContext) return
  const els = parse5.qsa(doc, el => el.attribs && 'tg-for' in el.attribs)
  await Promise.all(
    els.map(el => tgFor(el, tgContext))
  )
}
