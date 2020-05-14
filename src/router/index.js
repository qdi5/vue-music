import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/views/index.vue'
import store from '@/store'
Vue.use(Router)

const Recommend = () => import('@/views/recommend.vue')

const SongList = () => import('@/components/services/songList/songList.vue')

const SearchList = () => import('@/components/services/searchList/searchList.vue')

const Singer = () => import('@/views/singer.vue')

const Rank = () => import('@/views/rank.vue')

const Search = () => import('@/views/search.vue')

const User = () => import('@/views/user.vue')

const NotFound = () => import('@/views/404.vue')

let router = new Router({
  routes: [
    {
      path: '/',
      redirect: 'recommend',
      component: Index,
      children: [
        {
          path: 'recommend',
          name: 'recommend',
          component: Recommend,
          children: [
            {
              path: ':id',
              name: 'songList',
              props: true,
              component: SongList
            }
          ]
        },
        {
          path: 'singer',
          name: 'singer',
          component: Singer,
          children: [
            {
              path: ':id',
              props: true,
              component: SearchList
            }
          ]
        },
        {
          path: 'rank',
          name: 'rank',
          component: Rank,
          children: [
            {
              path: ':id',
              name: 'rankList',
              props: true,
              component: SongList
            }
          ]
        },
        {
          path: 'search',
          name: 'search',
          component: Search,
          children: [
            {
              path: ':id',
              name: 'searchList',
              props: true,
              component: SearchList
            }
          ]
        },
        {
          path: 'user',
          name: 'user',
          component: User
        }
      ]
    },
    {
      path: '*',
      name: '404',
      component: NotFound
    }
  ]
})
let isFirst = true
router.beforeEach((to, from, next) => {
  if (isFirst) {
    // 从浏览器缓存里获取播放列表
    let localPlayListData = window.localStorage.getItem('PLAY_LIST')
    if ((!store.state.playList.length) && localPlayListData) {
      console.log('播放列表：', localPlayListData)
      store.commit('replacePlayList', JSON.parse(localPlayListData))
    }
    // 从浏览器里获取搜索历史记录
    let localSearchHistoryData = window.localStorage.getItem('SEARCH_HISTORY')
    if ((!store.state.searchHistory.length) && localSearchHistoryData) {
      console.log('搜索历史:', localSearchHistoryData)
      let ary = JSON.parse(localSearchHistoryData)
      ary.forEach(val => {
        store.commit('addSearchHistory', val)
      })
    }
    // 从浏览器里获取播放历史记录
    let localPlayHistoryData = window.localStorage.getItem('PLAY_HISTORY')
    if ((!store.state.playHistory.length) && localPlayHistoryData) {
      console.log('播放历史:', localPlayHistoryData)
      store.commit('setPlayHistory', JSON.parse(localPlayHistoryData))
    }
    // 从浏览器里获取我喜欢的歌曲信息
    let localMyFavoriteData = window.localStorage.getItem('MY_FAVORITE')
    if (!store.state.myFavorite.length && localMyFavoriteData) {
      console.log('我喜欢的歌曲信息:', localMyFavoriteData)
      store.commit('setMyFavorite', JSON.parse(localMyFavoriteData))
    }
    isFirst = null
  }
  next()
})
export default router
