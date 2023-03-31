import * as html from '@synartisis/htmlparser'


/**
 * removes elements with tg-env different than the current env
 * @param {html.Document | html.Element} root 
 * @param {'development' | 'production'} currentEnv 
 */
export async function tgEnv(root, currentEnv) {
  if (!root) return 0
  const refs = html.qsa(root, el => el.type === 'tag' && !!el.attribs['tg-env'])
  if (!refs.length) return 0
  for (const el of refs) {
    if (el.type !== 'tag') continue
    if (el.attribs['tg-env'] !== currentEnv) {
      html.detachNode(el)
    } else {
      delete el.attribs['tg-env']
    }
  }
  return refs.length
}
