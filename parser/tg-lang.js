import * as html from '@synartisis/htmlparser'


/**
 * removes elements with lang different than the current language
 * @param {tagel.Node} root 
 * @param {string} lang 
 * @returns {Promise<number>}
 */
export async function tgLang(root, lang) {
  if (!root || !lang) return 0
  const refs = html.qsa(root, el => !!el?.attribs?.['lang'])
  if (!refs.length) return 0
  for (const el of refs) {
    if (el.attribs?.['lang'] !== lang) {
      html.remove(el)
    } else {
      delete el.attribs['lang']
    }
  }
  return refs.length
}
