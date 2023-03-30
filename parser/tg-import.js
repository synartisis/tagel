import path from 'node:path'
import fs from 'node:fs/promises'
import * as html from '@synartisis/htmlparser'


/**
 * imports html partials
 * @type {(root: tagel.Node, filename: string, errors: string[]) => Promise<number>}
 */
export async function tgImport(root, filename, errors) {
  const refs = html.qsa(root, el => el.name === 'link' && el.attribs?.['rel'] === 'import')
  if (!refs.length) return 0
  let errorCount = 0
  const dirname = path.dirname(filename)
  const partials = await Promise.all(refs.map(
    async ref => {
      const href = ref.attribs?.['href']
      let content
      if (href) {
        const partialPath = path.join(dirname, href)
        try {
          content = await fs.readFile(partialPath, 'utf-8')
        } catch (/**@type {any}*/error) {
          if (error?.code === 'ENOENT') {
            errors.push(`cannot find ${path.relative('.', partialPath)} referenced by ${path.relative('.', filename)} (${href})`)
            errorCount ++
          } else {
            throw error
          }
        }
      }
      return { ref, href, content }
    }
  ))
  for (const partial of partials) {
    if (!partial.content || !partial.href) continue
    const partialDoc = html.parseFragment(partial.content)
    const partialDir = path.dirname(partial.href)
    rewritePartials(partialDoc, partialDir)
    let insertAfterEl = partial.ref
    partialDoc.children?.forEach(child => {
      html.insertAfter(child, insertAfterEl)
      insertAfterEl = child
    })
    html.remove(partial.ref)
  }
  return refs.length - errorCount
}

  

/** @type {(doc: tagel.Node, relPath: string) => void} */
function rewritePartials(doc, relPath) {
  const partialRefs = html.qsa(doc, el => [ 'script', 'link', 'img', 'a' ].includes(el.name))
  partialRefs.map(async el => {
    if (!el.attribs) return
    if (el.name === 'script' && !el.attribs['src']) return
    if (el.name === 'link' && el.attribs['rel'] !== 'stylesheet' && el.attribs['rel'] !== 'import' && !el.attribs['rel'].includes('icon')) return
    if (el.name === 'img' && !el.attribs['src']) return
    if (el.name === 'a' && !el.attribs['href']) return
    const attr = 'src' in el.attribs ? 'src' : 'href'
    const uri = el.attribs[attr]
    const [ref, query] = uri && uri.split('?')
    if (ref === '' || ref.startsWith('/') || ref.split('/')[0].includes(':')) return  // if its an absolute url or only query, leave it alone
    let refNew = path.join(relPath, ref)
    if (query) refNew += '?' + query
    el.attribs[attr] = refNew
  })
}
