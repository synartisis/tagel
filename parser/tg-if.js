import * as parse5 from '../parse5.js'


export async function tgIf(el, tgContext, errors) {
  if (!tgContext) return
  const property = el.attribs['tg-if']
  if (property in tgContext) {
    const value = tgContext[property]
    delete el.attribs['tg-if']
    if (!value) parse5.remove(el)
  } else {
    errors.push(`[tg-if] property "${property}" not found`)
  }
}


export async function tgIfDoc(doc, tgContext) {
  if (!tgContext) return
  const els = parse5.qsa(doc, el => el.attribs && 'tg-if' in el.attribs)
  await Promise.all(
    els.map(el => tgIf(el, tgContext))
  )
}
