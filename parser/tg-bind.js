import * as parse5 from '../parse5.js'


export async function tgBind(el, tgContext, errors) {
  if (!tgContext || !el.attribs) return
  const property = el.attribs['tg-bind']
  if (property) {
    if (property in tgContext) {
      const value = tgContext[property]
      delete el.attribs['tg-bind']
      if (value != null) {
        const content = parse5.parseFragment(value)
        for (const child of content.children) {
          parse5.append(el, child)
        }
      }
    } else {
      errors.push(`[tg-bind] property "${property}" not found`)
    }
  }
  for (const bindAttr of Object.keys(el.attribs).filter(o => o.startsWith('tg:'))) {
    const attr = bindAttr.substring(3)
    const attrProp = el.attribs[bindAttr]
    if (attrProp in tgContext) {
      const value = tgContext[attrProp] ?? ''
      el.attribs[attr] = value
      delete el.attribs[bindAttr]
    } else {
      errors.push(`[tg-bind] attribute variable "${attrProp}" not found`)
    }
  }
}


export async function tgBindDoc(doc, tgContext, errors) {
  if (!tgContext) return
  const els = parse5.qsa(doc, el => el.attribs)
  await Promise.all(
    els.map(el => tgBind(el, tgContext, errors))
  )
}
