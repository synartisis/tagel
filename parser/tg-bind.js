import * as parse5 from '../parse5.js'


export async function tgBind(el, tgContext, errors) {
  if (!tgContext) return
  const property = el.attribs['tg-bind']
  if (property in tgContext) {
    const value = tgContext[property]
    delete el.attribs['tg-bind']
    if (value != null) {
      const content = parse5.createTextNode(value)
      parse5.append(el, content)
    }
  } else {
    errors.push(`[tg-bind] property "${property}" not found`)
  }
}


export async function tgBindDoc(doc, tgContext) {
  if (!tgContext) return
  const els = parse5.qsa(doc, el => el.attribs && 'tg-bind' in el.attribs)
  await Promise.all(
    els.map(el => tgBind(el, tgContext))
  )
}
