import * as html from '@synartisis/htmlparser'


/**
 * removes elements with lang different than the current language
 * @param {html.Document | html.Element} root 
 * @param {string} lang 
 * @returns {Promise<number>}
 */
export async function tgLang(root, lang) {
  if (!root || !lang) return 0
  const refs = html.qsa(root, el => el.type === 'tag' && el.name !== 'html' && !!el.attribs['lang'])
  if (refs.length === 0) return 0
  for (const el of refs) {
    if (el.type !== 'tag') continue
    if (el.attribs['lang'] !== lang) {
      html.detachNode(el)
    } else {
      delete el.attribs['lang']
    }
  }
  return refs.length
}
