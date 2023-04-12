import * as html from 'syn-html-parser'


/** 
 * removes elements with lang different than the current language
 * @type {(el: html.Element, state: tagel.State) => void}
 * */
export function tgLangElement(el, state) {
  if (state.toDetach.includes(el)) return
  const lang = html.getAttribute(el, 'lang')
  if (!lang || el.tagName === 'html') return
  if (lang !== state.lang) {
    state.toDetach.push(el)
  }
  html.removeAttribute(el, 'lang')
}