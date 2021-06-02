<template>
  <div id="search">
    <div class="search-wrapper flex-horizontal flex-horizontal-justify flex-vertical-center">
      <i class="iconfont icon-search"></i>
      <input class="search-input" v-model="keywords" type="text" placeholder="搜索歌曲、歌手">
      <i class="iconfont icon-qu-" v-show="keywords.length" @click="clear"></i>
    </div>
    <div class="shortcut-wrapper" ref="searchHistory" :style="'bottom:' + calcBottom">
      <div class="shortcut">
        <h2 class="hot-search-title">热门搜索</h2>
        <div class="hot-search flex-horizontal">
          <span v-for="(hot, index) in hotSearchData" :key="index" @click="hotTagClick(hot.first)">
            {{ hot.first }}
          </span>
          <loading v-if="!hotSearchData.length"></loading>
        </div>
        <div class="search-history-wrapper" v-if="getSearchHistory.length">
          <div class="search-history flex-horizontal-nowrap flex-horizontal-justify flex-vertical-center">
            <h3 class="search-history-title">搜索历史</h3>
            <i class="iconfont icon-delete" @click="removeSingleSearchHistory()" v-show="getSearchHistory.length > 1"></i>
          </div>
          <div class="history-list-wrapper">
            <p class="history flex-horizontal-nowrap flex-horizontal-justify flex-vertical-center" v-for="(history, index) in getSearchHistory" :key="index">
              <span @click="hotTagClick(history)">{{ history }}</span>
              <i class="iconfont icon-chacha" @click="removeSingleSearchHistory(history)"></i>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="search-result-wrapper" :style="'bottom:' + calcBottom " v-show="keywords.length" ref="searchResultWrapper">
      <div class="suggest">
        <ul class="suggest-item-wrapper">
          <template v-if="artists && artists.length">
            <template v-for="(singer, index) in artists" >
              <li class="suggest-item flex-horizontal-nowrap flex-vertical-center" :key="'singer' + singer.id"   @click="handleSearchItem('singer', singer.id, index, singer.name)">
                <i class="iconfont icon-username"></i>
                <p class="ellipsis">{{ singer.name }}</p>
              </li>
            </template>
          </template>
          <template v-if="songs && songs.length">
            <li class="suggest-item flex-horizontal-nowrap flex-vertical-center" v-for="(song, index) in songs" :key="'song' + song.id" @click="handleSearchItem('song', song.id, index)">
              <i class="iconfont icon-185068musicnotestreamline"></i>
              <p class="ellipsis">{{ song.name }}-{{ song.artists | formatArtists }}</p>
            </li>
          </template>
        </ul>
        <loading v-if="isShowLoading"></loading>
        <no-result v-if="isShowNoResult"></no-result>
      </div>
     
    </div>
    <transition enter-active-class="animated fadeInRight faster" leave-active-class="animated fadeOutRight faster">
      <router-view :key="key"></router-view>
    </transition>
  </div>
</template>
<script>
import { debounce, trim } from '@/utils'
import { search, getHotSearch } from '@/api'
import { axios } from '@/utils/request'
import { formatArtists } from '@/filters'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import Loading from '@/components/base/loading.vue'
import NoResult from '@/components/base/no-result/no-result.vue'
import BScroll from 'better-scroll'
export default {
  data () {
    return {
      keywords: '',
      searchResult: [],
      // 搜索到的歌手
      artists: [],
      // 搜索到的歌曲
      songs: [],
      // 热搜数据
      hotSearchData: [],
      // 正在播放的搜索到的歌曲索引
      searchedSongPlayingIndex: -1,
      noResult: null,
      isShowLoading: false,
      isShowNoResult: false
    }
  },
  activated () {
    if (this.shScroll) {
      this.shScroll.refresh()
    }
    if (this.searchScroll) {
       this.searchScroll.refresh()
    }
  },
  created () {
    getHotSearch().then(response => {
      if (response.code === 200) {
        this.hotSearchData = response.result.hots
      }
    })
  },
  mounted () {
    this.$nextTick().then(result => {
      this.shScroll = new BScroll(this.$refs.searchHistory, {click: true, stopPropagation: true})
    })
  },
  methods: {
    handleSearch: debounce(function () {
      let keyword = trim(this.keywords)
      console.log('arguments', arguments)
      if (keyword) {
        if (this.artists && this.artists.length) {
          this.artists = []
        }
        if (this.songs && this.songs.length) {
          this.songs = []
        }
        this.isShowLoading = true
        axios.all([search(keyword, 100), search(keyword)]).then(axios.spread((artistsData, songsData) => {
          if (artistsData.result.artists && artistsData.result.artists.length) {
            let artists = artistsData.result.artists
            let lg = artists.length
            this.artists = artists.slice(0, lg >= 3 ? 3 : lg)
          } else {
            this.artists = []
          }
          if (songsData.result.songs && songsData.result.songs.length) {
            this.songs = songsData.result.songs
          } else {
            this.songs = []
          }
          this.isShowLoading = false
          console.log('this.artists:', this.artists, '\n', 'this.songs:', this.songs)
          if ((!this.artists || !this.artists.length) && (!this.songs || !this.songs.length)) {
            console.log('显示没有结果组件')
            this.isShowNoResult = true
          } else {
            if (this.artists) {
              if (this.artists.length) {
                console.log('不显示结果组件 01')
                this.isShowNoResult = false
                return
              }
            }
            if (this.songs) {
              if (this.songs.length) {
                console.log('不显示结果组件 02')
                this.isShowNoResult = false
              }
            }
          }
          
        })).catch(error => {
          this.isShowLoading = false
          throw error
        })
      }
      this.searchedSongPlayingIndex = -1
    }, 200),
    handleSearchItem (type, id, index, singerName) {
      // 是不是相同的搜索关键字
      let isSameKeywords = true
      if (this.searchedSongPlayingIndex === -1) {
        isSameKeywords = false
      }
      // 如果点击的是歌手，则跳转到歌单路由
      if (type === 'singer') {
        this.$router.push({path: '/search/' + id, query: { title: singerName }})
      } else if (type === 'song') {
        // 点击的是歌曲，则直接播放
        this.beginPlay(id).then(songInfo => {
          this.searchedSongPlayingIndex = index
          if (songInfo) {
            this.setCurrentSong(songInfo)
            this.addSongToPlayList(songInfo)
          }
        })
      }
      if (!isSameKeywords) {
        // 存储搜索历史
        this.addSearchHistory(this.keywords)
      }
    },
    removeSingleSearchHistory (keyword) {
      if (typeof keyword !== 'undefined') {
        // 删除单条搜索记录
        this.removeSearchHistory(keyword)
      } else {
        // 默认删除所有搜索记录
        this.removeSearchHistory()
      }
    },
    hotTagClick (hottag) {
      this.keywords = hottag
    },
    clear () {
      this.keywords = ''
    },
    ...mapMutations(['addSearchHistory', 'removeSearchHistory', 'addSongToPlayList', 'setCurrentSong']),
    ...mapActions(['beginPlay'])
  },
  filters: {
    formatArtists
  },
  computed: {
    ...mapState({
      getSearchHistory (state) {
        return state.searchHistory
      }
    }),
    ...mapGetters(['calcBottom']),
    key () {
      return (typeof this.$route.name) !== 'undefined' ? this.$route.name + +new Date() : this.$route + +new Date()
    }
  },
  watch: {
    keywords: function (newKeywords) {
      this.handleSearch(newKeywords)
      if (this.isShowNoResult) {
        this.isShowNoResult = false
      }
      this.$nextTick(() => {
        /* eslint-disable no-new */
        if (this.searchScroll) {
          console.log('刷新scroll 嘿嘿')
          this.searchScroll.refresh()
        } else {
          this.searchScroll = new BScroll(this.$refs['searchResultWrapper'], {click: true, stopPropagation: true})
        }
      })
    },
    calcBottom: function () {
      this.$nextTick(() => {
        console.log('搜索页面刷新better-scroll')
        this.BScroll && this.BScroll.refresh()
      })
    },
    getSearchHistory: function () {
      console.log('刷新bs拉拉')
      if (!this.keywords.length) {
        this.shScroll && this.shScroll.refresh()
      }
    }
  },
  beforeDestroy () {
    this.shScroll && this.shScroll.destroy()
    this.searchScroll && this.searchScroll.destroy()
  },
  components: {
    Loading,
    NoResult
  }
}
</script>
<style lang="less">
#search {
  color: hsla(0,0%,100%,.3);
  .iconfont {
    color: hsla(0,0%,100%,.3);
  }
}
.search-wrapper {
  margin: 20px;
  height: 40px;
  padding: 0 6px;
  background: #333;
  border-radius: 6px;
  .search-input {
    color: #fff;
    flex: 1;
    font-size: 14px;
    line-height: 18px;
    background: #333;
    margin: 0 5px;
    outline: 0;
    border: 0;
    vertical-align: baseline;
    padding: 0;
    border: 0;
  }
  & > i {
    font-size: 24px;
  }
}
.hot-search-title {
  margin: 0 20px 20px;
  font-size: 14px;
}
.hot-search {
  position: relative;
  height: auto;
  margin: 0 20px 20px;
  & > span {
    margin: 0 20px 10px 0;
    background: #333;
    border-radius: 6px;
    padding: 5px 10px;
    font-size: 14px;
  }
}
.search-result-wrapper {
  position: fixed;
  top: 156px;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 10px 30px 0;
  overflow: hidden;
  background: #222;
}
.suggest-item-wrapper {
  .suggest-item {
    padding-bottom: 20px;
    & > i {
      margin-right: 14px;
    }
    & > p {
      margin: 0;
      font-size: 14px;

    }
  }
}
.search-history-wrapper {
  color: hsla(0,0%,100%,.5);
  h3 {
    margin: 0
  }
  margin: 0 20px;
}
.search-history-title {
  font-size: 14px;
}
.history-list-wrapper {
  .history {
    margin-bottom: 0;
  }
}
.shortcut-wrapper {
  position: fixed;
  top: 178px;
  bottom: 0;
  width: 100%;
  overflow: hidden;
  .shortcut {
    padding-bottom: 20px;
  }
}
</style>
