import path from 'path'
import { readFile, stat } from 'fs/promises'
import * as parse5 from './parse5.js'
import { applyTagel } from './parser/tagel-parser.js'

export { parse5, applyTagel }

export function tagelExpress(root, {} = {}) {
  return async (req, res, next) => {
    const { filename, content } = await readFileContent(root, req.url)
    if (content !== undefined) {
      const doc = parse5.parseHtml(content)
      await applyTagel(doc, filename, req.tgContext)
      return res.send(parse5.serialize(doc))
    }
    return next()
  }
}



async function readFileContent(root, url) {
  const fileUrl = url.split('?')[0]
  const filename = path.join(root, fileUrl)
  const fileext = path.extname(filename.split('/').pop())
  if (fileext === '') {
    let filestat
    try {
      filestat = await stat(filename)
    } catch (error) {}
    if (filestat?.isDirectory()) return readFileContent(root, path.join(url, 'index.html'))
    return readFileContent(root, url + '.html')
  }
  if (fileext === '.html') {
    let content
    try {
      content = await readFile(filename, 'utf-8')
    } catch (error) {}
    return { filename, content }
  }
  return {}
}
