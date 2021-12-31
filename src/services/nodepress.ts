/**
 * @file HTTP requester service
 * @module service.http
 * @author Surmon <https://github.com/surmon-china>
 */

import axios, { AxiosInstance } from 'axios'
import { BAD_REQUEST } from '/@/constants/error'
import API_CONFIG from '/@/config/api.config'
import { isClient } from '/@/app/environment'

export enum HTTPStatus {
  Error = 'error',
  Success = 'success'
}

type HTTPResult<T = any> = {
  status: HTTPStatus.Success
  message: string
  result: T
}

const nodepress = axios.create({
  baseURL: API_CONFIG.NODEPRESS,
  withCredentials: true
})

nodepress.interceptors.response.use(
  (response) => {
    if (response.headers['content-type'].includes('json')) {
      if (response.data.status !== HTTPStatus.Success) {
        return Promise.reject(response.data)
      }
    }

    return response.data
  },
  (error) => {
    const errorJSON = error.toJSON()
    const messageText = error.response?.data?.message || 'Error'
    const errorText = error.response?.data?.error || error.response?.statusText || errorJSON.message
    const errorInfo = {
      ...errorJSON,
      config: error.config,
      request: error.request,
      response: error.response,
      code: error.code || error.response?.status || BAD_REQUEST,
      message: messageText + ': ' + errorText
    }

    console.debug(
      'axios error:',
      isClient
        ? errorInfo
        : {
            name: errorJSON.name,
            message: errorJSON.message,
            status: errorJSON.status,
            code: errorJSON.code,
            method: errorJSON.config.method,
            baseURL: errorJSON.config.baseURL,
            url: errorJSON.config.url,
            data: errorJSON.config.data,
            headers: errorJSON.config.headers
          }
    )
    return Promise.reject(errorInfo)
  }
)

const service = {
  $: nodepress,
  request: <T = any>(...args: Parameters<AxiosInstance['request']>): Promise<HTTPResult<T>> =>
    nodepress.request(...args),
  get: <T = any>(...args: Parameters<AxiosInstance['get']>): Promise<HTTPResult<T>> =>
    nodepress.get(...args),
  delete: <T = any>(...args: Parameters<AxiosInstance['delete']>): Promise<HTTPResult<T>> =>
    nodepress.delete(...args),
  head: <T = any>(...args: Parameters<AxiosInstance['head']>): Promise<HTTPResult<T>> =>
    nodepress.head(...args),
  options: <T = any>(...args: Parameters<AxiosInstance['options']>): Promise<HTTPResult<T>> =>
    nodepress.options(...args),
  post: <T = any>(...args: Parameters<AxiosInstance['post']>): Promise<HTTPResult<T>> =>
    nodepress.post(...args),
  put: <T = any>(...args: Parameters<AxiosInstance['put']>): Promise<HTTPResult<T>> =>
    nodepress.put(...args),
  patch: <T = any>(...args: Parameters<AxiosInstance['patch']>): Promise<HTTPResult<T>> =>
    nodepress.patch(...args)
}

export default service
