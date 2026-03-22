import { NextRequest, NextResponse } from 'next/server'

export function computeDataHash(data: unknown): string {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

export function withETag<T extends Record<string, unknown>>(
  request: NextRequest,
  payload: T,
): NextResponse {
  const dataHash = computeDataHash(payload)
  const ifNoneMatch = request.headers.get('If-None-Match')

  const quotedETag = `"${dataHash}"`
  if (ifNoneMatch === quotedETag || ifNoneMatch === dataHash) {
    return new NextResponse(null, { status: 304 })
  }

  const body = { ...payload, data_hash: dataHash, timestamp: new Date().toISOString() }
  return NextResponse.json(body, {
    headers: { ETag: quotedETag },
  })
}
