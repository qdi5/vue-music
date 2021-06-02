export default {
  backend: {
    baseUrl: process.env.NODE_ENV === 'production' ? '/api' :'/api'
  }
}
