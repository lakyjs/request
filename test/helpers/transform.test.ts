import {describe,it,expect} from 'vitest'
import {transformRequest,transformResponse} from '@/helpers/transform'

describe('helpers:transform', () => {
  describe('transformRequest', () => {
    it('should transform request data to JSON string', () => {
      const data = { foo: 'bar' }
      const result = transformRequest(data)
      expect(result).toBe(JSON.stringify(data))
    })

    it('should return non-object data as is', () => {
      const data = 'foo'
      const result = transformRequest(data)
      expect(result).toBe(data)
    })
  })

  describe('transformResponse', () => {
    it('should parse JSON string response', () => {
      const data = '{"foo":"bar"}'
      const result = transformResponse(data)
      expect(result).toEqual({ foo: 'bar' })
    })

    it('should return the original string if it is not valid JSON', () => {
      const data = 'foo=bar'
      const result = transformResponse(data)
      expect(result).toBe(data)
    })

    it('should return non-string data as is', () => {
      const data = { foo: 'bar' }
      const result = transformResponse(data)
      expect(result).toEqual(data)
    })
  })
})
