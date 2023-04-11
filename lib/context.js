import * as html from 'syn-html-parser'

const scopes = new WeakMap


/** @type {(el: html.Element | html.Document, context: any) => void} */
export function setContext(el, context) {
  scopes.set(el, context)
}


/** @type {(el: html.Element) => any} */
export function getContext(el) {
  const context = scopes.get(el)
  if (context) return context
  if (!el.parentNode || !html.adapter.isElementNode(el.parentNode)) return {}
  return getContext(el.parentNode)
}


/** @type {(expression: string, context: object) => any} */
export function evaluate(expression, context) {
  const f = new Function(`'use strict'; return ${expression}`)
  const value = f.call(context)
  return value
}
