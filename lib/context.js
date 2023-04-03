import * as html from '@synartisis/htmlparser'
import { addError } from './errors.js'

const scopes = new WeakMap


/** @type {(el: html.domhandler.Element | html.domhandler.Document, context: any) => void} */
export function setContext(el, context) {
  scopes.set(el, context)
}


/** @type {(el: html.domhandler.Element | html.domhandler.Document) => any} */
export function getContext(el) {
  const context = scopes.get(el)
  if (context) return context
  if (el.parent?.type !== 'tag' && el.parent?.type !== 'root') return {}
  return getContext(el.parent)
}


/** @type {(expression: string, context: object) => any} */
export function evaluate(expression, context) {
  const f = new Function(`'use strict'; return ${expression}`)
  const value = f.call(context)
  return value
}
