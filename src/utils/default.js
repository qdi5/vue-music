export default {
  backend: {
    baseUrl: process.env.NODE_ENV === 'production' ? '/api' :'http://localhost:3000'
  }
}
