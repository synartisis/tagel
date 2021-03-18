import * as parse5 from '../parse5.js'
import { tgImport } from './tg-import.js'
import { tgEnv } from './tg-env.js'
import { tgFor } from './tg-for.js'
import { tgBind } from './tg-bind.js'
import { tgIf } from './tg-if.js'
import { detectLang, tgLang } from './tg-lang.js'


export async function applyTagel(doc, filename, root, tgContext) {
  const currentEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development'
  const lang  = detectLang(doc, tgContext)

  // console.log(JSON.stringify(tgContext,null,2))

  await parse5.walk(doc, async el => {
    if (el.name === 'link' && el.attribs?.['rel'] === 'import') await tgImport(el, doc, filename, root)
    if (el.attribs?.['tg-env']) await tgEnv(el, currentEnv)
    if (el.attribs?.['tg-for']) await tgFor(el, tgContext)
    if (el.attribs?.['tg-bind']) await tgBind(el, tgContext)
    if (el.attribs?.['tg-if']) await tgIf(el, tgContext)
    if (lang && el.attribs?.['lang']) await tgLang(el, lang)
  })

}
