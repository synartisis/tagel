import * as parse5 from '../parse5.js'


/**
 * removes elements with lang different than the current language
 * @param {tagel.Element} root 
 * @param {string} lang 
 * @returns {Promise<number>}
 */
export async function tgLang(root, lang) {
  if (!root || !lang) return 0
  const refs = parse5.qsa(root, el => el?.attribs?.['lang'])
  if (!refs.length) return 0
  for (const el of refs) {
    if (el.attribs['lang'] !== lang) {
      parse5.remove(el)
    } else {
      delete el.attribs['lang']
    }
  }
  return refs.length
}
