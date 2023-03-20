import path from 'node:path'
import fs from 'node:fs/promises'
import * as htmlParser from './html-parser.js'
import { applyTagel } from './parser/tagel-parser.js'

export { htmlParser, applyTagel }


/**
 * Applies tagel template engine to an html content
 * @param {string} html the html content to be parsed
 * @param {string} filename the filename (used for imports)
 * @param {object} context tagel context
 * @returns {Promise<string>}
 */
export async function tagel(html, filename, context) {
  const doc = htmlParser.parseHtml(html)
  await applyTagel(doc, filename, context)
  return htmlParser.serialize(doc)
}


/** @type {(root: string) => Function} */
export function tagelExpress(root, {} = {}) {
  /** @type {(req: any, res: any, next: any) => Promise<any>} */
  return async (req, res, next) => {
    const { filename, content } = await readFileContent(root, req.url)
    if (content !== undefined) {
      const doc = htmlParser.parseHtml(content)
      await applyTagel(doc, filename, req.tgContext)
      return res.send(htmlParser.serialize(doc))
    }
    return next()
  }
}



/** @type {(root: string, url: string) => Promise<{ filename: string, content?: string }>} */
async function readFileContent(root, url) {
  const fileUrl = url.split('?')[0]
  const filename = path.join(root, fileUrl)
  const fileext = path.extname(filename.split('/').pop() || '')
  if (fileext === '') {
    let filestat
    try {
      filestat = await fs.stat(filename)
    } catch (error) {}
    if (filestat?.isDirectory()) return readFileContent(root, path.join(fileUrl, 'index.html'))
    return readFileContent(root, fileUrl + '.html')
  }
  if (fileext === '.html') {
    let content
    try {
      content = await fs.readFile(filename, 'utf-8')
    } catch (error) {}
    return { filename, content }
  }
  return { filename }
}
