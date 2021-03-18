import * as parse5 from '../parse5.js'
import { tgImport } from './tg-import.js'
import { detectLang, tgLang } from './tg-lang.js'
import { tgEnv } from './tg-env.js'
import { tgIf } from './tg-if.js'
import { tgFor } from './tg-for.js'
import { tgBind } from './tg-bind.js'
import { showErrors } from '../utils.js'


export async function applyTagel(doc, filename, tgContext) {
  const currentEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development'
  const lang  = detectLang(doc, tgContext)

  // console.log(JSON.stringify(tgContext,null,2))

  const errors = []
  await parse5.walk(doc, async el => {
    if (el.name === 'link' && el.attribs?.['rel'] === 'import') await tgImport(el, filename, errors)
    if (lang && el.attribs?.['lang']) await tgLang(el, lang)
    if (el.attribs?.['tg-env']) await tgEnv(el, currentEnv)
    if (el.attribs?.['tg-if']) await tgIf(el, tgContext, errors)
    if (el.attribs?.['tg-for']) await tgFor(el, tgContext, errors)
    await tgBind(el, tgContext, errors)
  })
  if (errors.length) {
    if (currentEnv === 'development') showErrors(doc, errors)
    errors.forEach(err => console.error('[template error]', err))
  }

}
