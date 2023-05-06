/**
 * tagel html templage engine
 * @param html html content
 * @param filename the filename
 * @param context the context to use in binding
 */
export function tagel(html: string, filename: string, context: any): Promise<string>


/**
 * applies tagel engine to source
 */
export function applyTagel(source: string, filename: string, context: any): Promise<string>


/**
 * tagel middleware for express.js
 * @param root the root path used to find files
 */
export function tagelExpress(root: string): Function