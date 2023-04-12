import * as html from 'syn-html-parser'
import { setContext } from '../context.js'
import { tgImportElement } from './tg-import.js'
import { tgLangElement } from './tg-lang.js'
import { tgIfElement } from './tg-if.js'
import { tgBindElement } from './tg-bind.js'
import { tgForElement } from './tg-for.js'
import { brackets } from './bracket-binding.js'


/** @type {(doc: html.Document, state: tagel.State) => Promise<void>} */
export async function tgElementsHandler(doc, state) {
  const htmlElement = html.qs(doc, o => o.tagName === 'html')
  if (!htmlElement) throw new Error(`tgElementsHandler: html element not found`)
  await tgElement(htmlElement, state)
  // state.toDetach.forEach(el => { if (html.getAttributes(el)['tagel'] !== 'error') html.detachNode(el) })
  state.toDetach.forEach(html.detachNode)
}



/** @type {(el: html.Element | html.TextNode, state: tagel.State) => Promise<void>} */
async function tgElement(el, state) {
  // console.log(el.nodeName)
  if (html.adapter.isElementNode(el)) {
    const attrs = html.getAttributes(el)
    await tgLangElement(el, attrs, state)
    await tgIfElement(el, attrs, state)
    await tgImportElement(el, attrs, state)
    await tgForElement(el, attrs, state)
    await tgBindElement(el, attrs, state)
  }
  if (html.adapter.isTextNode(el)) {
    brackets(el, state)
  }
  if ('childNodes' in el && !state.toDetach.includes(el)) {
    for (const child of el.childNodes) {
      if (html.adapter.isElementNode(child) || html.adapter.isTextNode(child)) {
        await tgElement(child, state)
      }
    }
  }
}
