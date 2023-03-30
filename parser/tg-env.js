import * as html from '@synartisis/htmlparser'


/**
 * removes elements with tg-env different than the current env
 * @param {tagel.Node} root 
 * @param {'development' | 'production'} currentEnv 
 * @returns {Promise<number>}
 */
export async function tgEnv(root, currentEnv) {
  if (!root) return 0
  const refs = html.qsa(root, el => !!el.attribs?.['tg-env'])
  if (!refs.length) return 0
  for (const el of refs) {
    if (el.attribs?.['tg-env'] !== currentEnv) {
      html.remove(el)
    } else {
      delete el.attribs['tg-env']
    }
  }
  return refs.length
}
