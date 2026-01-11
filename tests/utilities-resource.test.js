import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import resource from '../you/utilities/resource.js'

describe('resource.json.load', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('네트워크 오류 시 의미 있는 에러를 던진다', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404
    })

    await expect(resource.json.load('test.json'))
      .rejects.toThrow(/404/)
  })

  it('존재하지 않는 accessor 접근 시 에러를 던진다', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ foo: { bar: 'baz' } })
    })

    await expect(resource.json.load('test.json:foo.nonexistent.path'))
      .rejects.toThrow(/accessor/i)
  })

  it('정상적인 JSON 로드가 성공한다', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ foo: 'bar' })
    })

    const result = await resource.json.load('test.json')
    expect(result).toEqual({ foo: 'bar' })
  })

  it('정상적인 accessor 접근이 성공한다', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ foo: { bar: 'baz' } })
    })

    const result = await resource.json.load('test.json:foo.bar')
    expect(result).toBe('baz')
  })

  it('중간 경로가 null이면 에러를 던진다', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ foo: null })
    })

    await expect(resource.json.load('test.json:foo.bar'))
      .rejects.toThrow(/accessor/i)
  })
})
