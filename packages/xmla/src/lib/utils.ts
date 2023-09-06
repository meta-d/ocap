/**
 * 试探性获取错误信息文本
 * @todo ? 有没有更好的方式
 *
 * @param err
 * @returns
 */
export function getErrorMessage(err: any): string {
  let error: string
  if (typeof err === 'string') {
    error = err
  } else if (err instanceof Error) {
    error = err?.message
  } else if (err?.error instanceof Error) {
    error = err?.error?.message
  } else if (typeof err?.error === 'string') {
    error = err.error
  } else {
    error = err
  }

  return error
}

export function simplifyErrorMessage(message: string): string {
  return typeof message === 'string' ? message.trim().replace(/^00[A-Z0-9]{6}\s*The Mondrian XML: (Mondrian Error:)?/g, '') : message
}
