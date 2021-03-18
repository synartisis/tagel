import * as parse5 from '../parse5.js'


export async function tgLang(el, lang) {
  if (!lang) return
  if (el.attribs?.['lang'] && el.attribs?.['lang'] !== lang) {
    parse5.remove(el)
  }
}


export async function tgLangDoc(doc, tgContext) {
  const lang = detectLang(doc, tgContext)
  const els = parse5.qsa(doc, el => el.attribs && 'lang' in el.attribs && el.attribs['lang'] !== lang)
  await Promise.all(
    els.map(el => parse5.remove(el))
  )
}


export function detectLang(doc, tgContext) {
  const htmlTag = parse5.qs(doc, el => el.name === 'html')
  if (!htmlTag) return null
  if (tgContext.lang) {
    htmlTag.attribs['lang'] = tgContext.lang
  }
  const lang = htmlTag.attribs['lang']
  return lang
}
