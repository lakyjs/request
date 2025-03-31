import {isPlainObject} from './is'

export function transformRequest(data:unknown){
  if(isPlainObject(data)) return JSON.stringify(data)

  return data
}

export function transformResponse(data:unknown){
  if(typeof data === 'string'){
    try {
      data = JSON.parse(data)
    } catch (error) {
      // do nothing
    }
  }
  return data
}
