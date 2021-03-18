import * as parse5 from '../parse5.js'

export async function tgEnv(el, currentEnv) {
  if (el.attribs['tg-env'] !== currentEnv) {
    parse5.remove(el)
  } else {
    delete el.attribs['tg-env']
  }
}


export async function tgEnvDoc(doc, currentEnv) {
  const els = parse5.qsa(doc, el => el.attribs && 'tg-env' in el.attribs)
  await Promise.all(
    els.map(el => tgEnv(el, currentEnv))
  )
}