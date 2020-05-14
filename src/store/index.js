import Vue from 'vue'
import Vuex from 'vuex'
import {
  getSongUrl,
  getSongDetail,
  getLyric
} from '@/api/index.js'
import { axios } from '@/utils/request'
import { parseLyric, trim, randomNum } from '@/utils'
import { isIOS } from '@/utils/env'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 当前歌曲 playingSongInfo
    currentSong: {},
    // 播放状态
    isPlaying: false,
    // 播放器是否全屏状态
    isFullScreen: false,
    // 是否显示mini播放器
    isSHowPlayer: false,
    // 播放列表
    playList: [],
    // 播放历史
    playHistory: [],
    // 我喜欢的
    myFavorite: [],
    // 歌词时间数组
    time: [],
    // 歌词数组
    lyric: [],
    // 搜索历史
    searchHistory: [],
    // 当前歌曲在播放列表中的索引
    currentSongIndex: -1,
    // 是否是新的歌曲id，根据这个值，来判断是否添加到播放列表里
    isNewSongId: true,
    // 正在播放列表里的最后一首歌曲时，删除后，是否继续播放
    isContinuePlay: false,
    // 播放模式
    playMode: ['loop', 'order', 'random'],
    // 当前播放模式索引
    playModeIndex: 0
  },
  mutations: {
    setSHowPlayer (state, isShow) {
      state.isSHowPlayer = isShow
    },
    setFullScreen (state, isFullScreen) {
      state.isFullScreen = isFullScreen
    },
    setCurrentSong (state, song) {
      state.currentSong = {...song}
    },
    setPlayStatus (state, status) {
      state.isPlaying = status
    },
    setLyricObj (state, lyricAry) {
      state.lyricObj = lyricAry
    },
    setLyric (state, lyric) {
      state.lyric = lyric
    },
    setTime (state, time) {
      state.time = time
    },
    setContinuePlay (state, bool) {
      state.isContinuePlay = bool
    },
    addSearchHistory (state, keywords) {
      let hasNotSameKeyword = state.searchHistory.every(item => {
        if (trim(item) === keywords) {
          return false
        }
        return true
      })
      if (hasNotSameKeyword) {
        state.searchHistory.push(keywords)
        window.localStorage.setItem(
          'SEARCH_HISTORY',
          JSON.stringify(state.searchHistory)
        )
      }
    },
    setPlayModeIndex (state, index) {
      state.playModeIndex = index
    },
    // 如果不传递keywords，默认删除搜索历史的所有记录
    // 传递keywords，则删除单条记录
    removeSearchHistory (state, keywords) {
      if (typeof keywords === 'undefined') {
        state.searchHistory = []
        window.localStorage.removeItem('SEARCH_HISTORY')
        return false
      }
      state.searchHistory.every((keyword, index) => {
        if (keyword === keywords) {
          state.searchHistory.splice(index, 1)
          // console.log('state.searchHistory', [...state.searchHistory])
          // window.localStorage.removeItem('SEARCH_HISTORY')
          window.localStorage.setItem(
            'SEARCH_HISTORY',
            JSON.stringify([...state.searchHistory])
          )
          return false
        }
        return true
      })
    },
    // 添加歌曲到播放列表里
    // isUnchangeIndex属性用来标记，是否需要改变当前的currentSongIndex
    addSongToPlayList (state, song) {
      let index = 0
      if (typeof song === 'object') {
        state.isNewSongId = state.playList.every((item, i) => {
          if (item.songId === song.songId) {
            index = i
            return false
          }
          return true
        })
        // 如果歌曲id不存在播放列表中，则添加到播放列表
        if (state.isNewSongId) {
          state.playList.push(song)
          index = state.playList.length - 1
          window.localStorage.setItem(
            'PLAY_LIST',
            JSON.stringify([...state.playList])
          )
        }
      }
      if (!song['isUnchangeIndex']) {
        state.currentSongIndex = index
      }
    },
    replacePlayList (state, playList) {
      if (
        Object.prototype.toString.call(playList).toLowerCase() !==
        '[object array]'
      ) {
        return
      }
      state.playList = playList
    },
    // 从播放列表移除歌曲
    removeSongFromPlayList (state, songId) {
      let list = state.playList
      list.forEach((item, index) => {
        if (item.songId === songId) {
          list.splice(index, 1)
          if (list.length) {
            // 当前删除的索引如果小于当前正在播放歌曲的索引，则，当前播放的索引需要减去 1
            if (index < state.currentSongIndex) {
              --state.currentSongIndex
            } else if (index === state.currentSongIndex) {
              // 当前删除的索引等于正在播放歌曲的索引，分两种情况
              // 1、当前删除的是list的最后一个元素，又分两种情况
              // a、是最后一个元素，而且是数组唯一一个元素。直接给当前索引值赋值为 0
              // b、是最后一个元素，不是数组唯一的元素。直接给当前索引值赋值为 0
              // 2、当前删除的不是未删除这个元素之前那个数组的最后一个元素，那么当前索引值直接赋值为被删除的索引值
              if (index === list.length) {
                state.currentSongIndex = 0
              } else {
                state.currentSongIndex = index
              }
              // 只有在播放状态下，才继续播放下一首
              if (state.isPlaying) {
                state.isContinuePlay = true
              }
            }
            // window.localStorage.removeItem('PLAY_LIST')
            window.localStorage.setItem(
              'PLAY_LIST',
              JSON.stringify([...state.playList])
            )
          } else {
            window.localStorage.removeItem('PLAY_LIST')
            state.currentSong.songUrl = ''
            state.isPlaying = false
          }
        }
      })
    },
    setCurrentSongIndex (state, index) {
      state.currentSongIndex = index
    },
    // 存储歌曲到播放历史中
    // 2、如果不存在，则直接push
    addToPlayHistory (state, songInfo) {
      let playHistory = state.playHistory
      if (!playHistory.length) {
        playHistory.push(songInfo)
        window.localStorage.setItem('PLAY_HISTORY', JSON.stringify(playHistory))
        return
      }
      // 记录songInfo与播放历史相同的歌曲索引
      let hasSameSongId = false
      for (let i = 0; i < playHistory.length; i++) {
        // 1、如果播放历史中已存在，同时，这首歌曲索引不为0，则将当前歌曲提取到数组最开头
        if (playHistory[i].songId === songInfo.songId) {
          hasSameSongId = true
          // unshift往数组最前面添加元素
          playHistory.unshift(playHistory.splice(i, 1)[0])
          break
        }
      }
      if (!hasSameSongId) {
        playHistory.push(songInfo)
        window.localStorage.setItem('PLAY_HISTORY', JSON.stringify(playHistory))
      }
    },
    setPlayHistory (state, data) {
      state.playHistory = data
    },
    setMyFavorite (state, favorite) {
      state.myFavorite = favorite
    },
    addToMyFavorite (state, song) {
      let hasSameSongId = state.myFavorite.some(item => {
        if (item.songId === song.songId) {
          return true
        }
        return false
      })
      if (!hasSameSongId) {
        state.myFavorite.push(song)
        window.localStorage.setItem(
          'MY_FAVORITE',
          JSON.stringify(state.myFavorite)
        )
      }
    },
    removeFromMyFavorite (state, song) {
      let myFavorite = state.myFavorite
      let isExist = false
      for (let i = 0; i < myFavorite.length; i++) {
        let currentFavorite = myFavorite[i]
        if (currentFavorite.songId === song.songId) {
          myFavorite.splice(i, 1)
          isExist = true
          break
        }
      }
      if (isExist) {
        window.localStorage.setItem('MY_FAVORITE', JSON.stringify(myFavorite))
      }
    }
  },
  actions: {
    // 公用开始播放函数
    beginPlay ({ dispatch, commit, state }, songId) {
      // debugger
      // 当播放的歌曲已存在于播放列表时，直接获取“播放列表”里的数据
      if (state.currentSong && state.currentSong.songId === songId) {
        return false
      }
      // 解决IOS浏览器播放不了的hack办法
      if (isIOS) {
        console.log('苹果手机来了……', isIOS)
        let audio = document.getElementById('audio')
        if (!audio.getAttribute('src')) {
          console.log('首次播放……')
          audio.setAttribute('src', '/mp3/empty.mp3')
          audio.play()
        }
      }
      let isSHowPlayer = state.isSHowPlayer
      if (!isSHowPlayer) {
        state.isSHowPlayer = true
      }
      return dispatch('getSongInfo', songId)
    },
    // 获取当前歌曲的主要信息
    getSongInfo ({ state }, songId) {
      return axios
        .all([getSongUrl(songId), getSongDetail(songId), getLyric(songId)])
        .then(
          axios.spread(function (urlData, songDetailData, lyricData) {
            let songInfo = null
            let songUrl = ''
            if (urlData.code === 200) {
              songUrl = urlData.data[0].url
            }
            if (songDetailData.code === 200) {
              let songDetail = songDetailData.songs[0]
              songInfo = {
                songId,
                name: songDetail.name,
                singer: songDetail.ar[0].name,
                picUrl: songDetail.al.picUrl,
                songUrl: songUrl || ''
              }
            }
            if (lyricData.code === 200) {
              let lyric = lyricData.lrc && lyricData.lrc.lyric
              songInfo['lyric'] = lyric
            }
            let myFavorite = state.myFavorite
            // 加上isLike属性
            let hasSameId = myFavorite.some(song => {
              if (songId === song.songId) {
                return true
              }
              return false
            })
            if (hasSameId && !songInfo['isLike']) {
              // 使用Vue.set方法将isLike变成响应式的属性
              Vue.set(songInfo, 'isLike', true)
            } else {
              Vue.set(songInfo, 'isLike', false)
            }
            return songInfo
          })
        )
    },
    // 获取音乐的mp3 url地址
    getMusicUrl (context, songId) {
      let songUrl = ''
      return getSongUrl(songId).then(urlData => {
        if (urlData.code === 200) {
          songUrl = urlData.data[0].url
        }
        return songUrl
      })
    },
    // 根据传入进来的歌曲对象，响应式的更新对象的属性
    updateSongInfo ({ commit, dispatch }, songObj) {
      // debugger
      return dispatch('getMusicUrl', songObj.songId)
        .then(songUrl => {
          // debugger
          // 使用Vue.set给已存在的响应式对象设置响应式属性
          if (songUrl) {
            if (songUrl.indexOf('?') < 0) {
              songUrl += '?s=' + new Date()
            } else {
              songUrl += '&s=' + new Date()
            }
          } else {
            // 给歌曲设置一个唯一的播放地址，以便能触发audio的error事件；
            // 这样才能实现一首歌曲报错后，尝试播放三次后，如果还是播放不了，
            // 则播放下一首。
            songUrl = +new Date()
          }
          Vue.set(songObj, 'songUrl', songUrl)
          return songObj
        })
        .catch(err => {
          return err
        })
    },
    // action调用歌词解析
    analyzeLyric ({ commit }, lyric) {
      if (lyric) {
        let { tm, lc } = parseLyric(lyric)
        commit('setTime', tm)
        commit('setLyric', lc)
      } else {
        commit('setLyric', null)
      }
    },
    // 随机播放全部
    playAllMusicRandom ({dispatch, state, commit}, songAry) {
      // debugger
      commit('replacePlayList', songAry)
      commit('setPlayModeIndex', 2)
      let currentSongIndex = randomNum(0, state.playList.length)
      commit('setCurrentSongIndex', currentSongIndex)
      return dispatch('beginPlay', state.playList[currentSongIndex].songId)
    }
  },
  getters: {
    isPlaying: state => state.isPlaying,
    calcBottom: state => {
      return state.isSHowPlayer && !state.isFullScreen ? '60px' : '0'
    },
    // 获取喜欢状态
    getFavoriteStatus: state => (id) => {
      if (!state.myFavorite || !state.myFavorite.length) {
        return false
      }
      return state.myFavorite.some(item => {
        return item.songId === id
      })
    }
  }
})
