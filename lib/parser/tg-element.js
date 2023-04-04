import * as html from '@synartisis/htmlparser'
import { notTgForDescendant } from '../utils.js'
import { tgImportElement, tgImport } from './tg-import.js'
import { tgLangElement } from './tg-lang.js'
import { tgIfElement } from './tg-if.js'
import { tgForElement } from './tg-for.js'
import { tgBindElement } from './tg-bind.js'



/** @type {(treeRoot: html.domhandler.Document | html.domhandler.Element, filename?: string, lang?: string) => Promise<void>} */
export async function tgElementTree1(treeRoot, filename, lang) {
  await tgImport(treeRoot, filename)
}



// /** @type {(doc: html.domhandler.Document) => Promise<number>} */
// export async function applyTgElements(doc) {
//   const nodes = html.findAll(doc, node => node.type === 'tag' || node.type === 'script' || node.type === 'style' || node.type === 'text')
//   for await (const node of nodes) {
//     if (node.type === 'tag' || node.type === 'script' || node.type === 'style') {

//     }
//   }
  
// }
let cnt=0
const pendingElements = []
let filenameCached = ''
let langCached = ''

/** @type {(treeRoot: html.domhandler.Document | html.domhandler.Element, filename?: string, lang?: string) => Promise<void>} */
export async function tgElementTree(treeRoot, filename, lang) {
if (treeRoot?.type === 'root') cnt=0
if (filename) {
  filenameCached = filename
} else {
  filename = filenameCached
}
if (lang) {
  langCached = lang
} else {
  lang = langCached
}
const nodes = html.findAll(treeRoot, node => node.type === 'tag' || node.type === 'script' || node.type === 'style' || node.type === 'text')
  // const nodes = html.findAll(treeRoot, node => true)
  for await (const node of nodes) {
    // if(!notTgForDescendant(node)) continue
    cnt++
    if (node.type === 'tag' || node.type === 'script' || node.type === 'style') {
      await tgElement(node, filename, lang)
    }
    if (node.type === 'text') {
      await tgText(node)
    }
  }
  // console.log(cnt, pendingElements.length)
}


/** @type {(el: html.domhandler.Element, filename: string, lang: string) => Promise<void>} */
async function tgElement(el, filename, lang) {
  if (el.parent) await tgLangElement(el, lang)
  if (el.parent) await tgIfElement(el)
  if (el.parent) await tgImportElement(el, filename)
  if (el.parent) await tgForElement(el)
  if (el.parent) await tgBindElement(el)
}


/** @type {(el: html.domhandler.Text) => Promise<void>} */
async function tgText(el) {

}