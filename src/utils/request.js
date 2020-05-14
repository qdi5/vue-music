import axios from 'axios'
import global from './default'

let apiPath = global.backend.baseUrl

// 基本配置
const Util = {
  apiUrl: {
    apiPath: apiPath
  }
}

// ajax通用配置
let request = Util.ajax = axios.create({
  baseURL: Util.apiUrl.apiPath,
  withCredentials: true
})

// 设置默认请求超时时间50s
Util.ajax.defaults.timeout = 1000 * 60 * 3

// 添加响应拦截器
Util.ajax.interceptors.response.use(res => {
  return res.data
}, error => {
  return Promise.reject(error)
})
export { axios }
export { request }
export default (Vue, options) => {
  Vue.prototype.$http = {
    get: Util.ajax.get,
    post: Util.ajax.post,
    put: Util.ajax.put,
    delete: Util.ajax.delete
  }
}
