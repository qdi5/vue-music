<template>
  <div class="player">
    <transition enter-active-class="animated slideInUp faster" leave-active-class="animated slideOutDown faster">
      <div class="mini-player flex-horizontal-nowrap flex-vertical-center flex-horizontal-justify" v-show="isSHowPlayer && !isFullScreen">
        <div class="song-info flex-horizontal-nowrap flex-vertical-center ellipsis" @click.stop="$store.commit('setFullScreen', true)">
          <img class="song-img image playing" :class="{played: isPlaying, pause: !isPlaying}" :src="currentSong.picUrl" alt="">
          <div class="flex-vertical flex-horizontal-center text">
            <div class="song-name ellipsis">{{ currentSong.name }}</div>
            <div class="singer ellipsis" >{{ currentSong.singer }}</div>
          </div>
        </div>
        <div class="control flex-horizontal flex-horizontal-justify">
          <i class="iconfont" :class="{'icon-pause': isPlaying, 'icon-play': !isPlaying}" @click="togglePlay"></i>
          <i class="iconfont icon-bofangliebiao" @click="isShowPlayList = true"></i>
        </div>
      </div>
    </transition>
    <transition enter-active-class="animated rotateInDownRight faster" leave-active-class="animated rotateOutUpRight faster">
      <div v-show="isFullScreen" class="normal-player">
        <div class="bg-img">
          <img width="100%" height="100%" :src="currentSong.picUrl">
        </div>
        <div class="top">
          <i class="iconfont icon-back bottom" @click.stop="$store.commit('setFullScreen', false)"></i>
          <h1 class="title ellipsis">{{ currentSong.name }}</h1>
          <div class="singer-name">{{ currentSong.singer }}</div>
        </div>
        <div class="middle" @touchstart="handleStart" @touchmove.prevent="handleMove" @touchend="handleEnd">
          <transition name="fade">
            <div class="middle-left" v-show="!isShow">
              <div class="cd-wrap">
                <div class="cd">
                  <img class="image playing" :class="{played: isPlaying, pause: !isPlaying}" :src="currentSong.picUrl">
                </div>
              </div>
              <div class="mini-lyric-wrapper">
                <div class="mini-lyric">
                  <div>{{ (getLyrics && getLyrics.length) ? getLyrics[currentLyric] : '暂无歌词' }}</div>
                </div>
              </div>
            </div>
          </transition>
          <transition enter-active-class="animated slideInRight faster"
          leave-active-class="animated slideOutRight faster">
            <div class="middle-right" v-show="isShow" ref="mdr">
              <div class="lyric-wrapper" ref="lyricWrapper">
                <template v-if="getLyrics && getLyrics.length">
                  <p class="text" v-for="(lyric, index) in getLyrics" :key="index" :class="{current: currentLyric === index}">{{ lyric }}</p>
                </template>
                <div v-else class="flex-horizontal flex-horizontal-center flex-vertical-center" style="position: absolute;width: 100%;min-height: 100%;top: 0;bottom: 0;margin: auto;">
                  <p class="text">暂无歌词</p>
                </div>
              </div>
            </div>
          </transition>
        </div>
        <div class="foot">
          <div class="dots">
            <span :class="{active: direction == 0}"></span>
            <span :class="{active: direction == 1}"></span>
          </div>
          <div class="progress-wrapper flex-horizontal-nowrap flex-vertical-center">
            <span class="time playing-time" v-if="currentTime !==null " v-cloak>{{ currentTime | formatTime }}</span>
            <div class="progress-bar-wrapper">
              <div class="progress-bar-inner" ref="progress">
                <!-- 实际计算的时候需要减去progress-bar的半径 -->
                <div  class="progress" :style="calcPlayPercent" ref="ps">
                  <div ref="progressBtnWrapper" class="progress-btn-wrapper flex-horizontal flex-vertical-center flex-horizontal-center" @touchstart="handleBarStart" @touchmove.prevent="handleBarMove" @touchend="handleBarEnd">
                    <div class="progress-btn" ref="progressBtn" ></div>
                  </div>
                </div>
              </div>
            </div>
            <span class="time endtime" v-cloak>{{ duration | formatTime }}</span>
          </div>
          <div class="operators flex-horizontal-nowrap flex-vertical-center flex-horizontal-around">
            <div class="mode-wrap left" @click.stop="togglePlayMode()">
              <i class="iconfont mode" :class="{'icon-danquxunhuan': playModeIndex === 0, 'icon-shunxubofang': playModeIndex === 1, 'icon-suijibofang': playModeIndex === 2}"></i>
            </div>
            <div class="prev-wrap left" @click.stop="playPrevSong()">
              <i class="iconfont icon-prevc"></i>
            </div>
            <div class="play-wrap center">
              <i class="iconfont play" @click.stop="togglePlay" :class="{'icon-pause': isPlaying, 'icon-play': !isPlaying}"></i>
            </div>
            <div class="next-wrap right" @click.stop="playNextSong()">
              <i class="iconfont icon-nextc"></i>
            </div>
            <div class="like-wrap right" @click="toggleLikeStatus(currentSong)">
              <i class="iconfont" :class="{'icon-like1': !getFavoriteStatus(currentSong.songId), 'icon-like': getFavoriteStatus(currentSong.songId)}"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!-- 播放列表 begin-->
    <transition enter-active-class="animated fadeIn faster" leave-active-class="animated fadeOut faster">
      <div class="playlist-wrap" v-show="isShowPlayList" @click="isShowPlayList = false">
        <transition enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown">
          <div class="playlist" v-show="isShowPlayList" @click.stop.prevent="">
            <div class="list" ref="playListRef">
              <ul>
                <template v-for="(playList, index) in getPlayList" >
                  <li :key="playList.songId" ref="playItem" class="flex-horizontal flex-horizontal-justify flex-vertical-center playlist-item">
                    <div class="song-name-wrap flex-horizontal flex-vertical-center" @click.stop="handlePlayListSong(playList.songId, index)">
                      <span>
                        <i :class="{iconfont: playList.songId === currentSong.songId, 'icon-pause': (playList.songId === currentSong.songId) && isPlaying, 'icon-play': (playList.songId === currentSong.songId && !isPlaying)}"></i>
                      </span>
                      <span class="text ellipsis">{{ playList.name }}</span>
                    </div>
                    <div class="opreate">
                      <span class="like-icon-wrap" @click.stop="toggleLikeStatus(playList)">
                        <i class="iconfont" :class="{'icon-like': $store.getters.getFavoriteStatus(playList.songId), 'icon-like1': !$store.getters.getFavoriteStatus(playList.songId)}"></i>
                      </span>
                      <span @click.stop="removeMusicFromPlayList(playList.songId)">
                        <i class="iconfont icon-chacha"></i>
                      </span>
                    </div>
                  </li>
                </template>
              </ul>
            </div>
            <div class="add-to-playlist">
              <div class="add flex-horizontal flex-vertical-center" @click="isShowAddSongToPlaylist = true">
                <i class="iconfont icon-add"></i>
                <span>添加歌曲到列表</span>
              </div>
            </div>
            <div class="close-list" @click="isShowPlayList = false">关闭</div>
          </div>
        </transition>
        <!-- 播放列表 end -->
        <!-- 添加歌曲到列表 begin -->
        <transition enter-active-class="animated slideInRight faster" leave-active-class="animated slideOutRight faster">
          <div class="playlist-add-wrapper" @click.stop="" v-show="isShowAddSongToPlaylist">
            <i class="iconfont icon-chacha close-btn" @click="isShowAddSongToPlaylist = false"></i>
            <h1 class="title">
              添加歌曲到列表
            </h1>
            <div class="search-wrap">
              <div class="search flex-horizontal flex-vertical-center">
                <i class="iconfont icon-search"></i>
                <input type="text" class="search-content" placeholder="搜索歌曲" v-model="keywords">
                <i class="iconfont icon-chacha" v-show="keywords.length" @click.stop="clearKeywords"></i>
              </div>
            </div>
            <!-- 搜索结果 begin -->
            <div class="search-result-wrapper" v-show="keywords.length" ref="searchResultWrapper">
              <div class="suggest">
                <ul class="suggest-item-wrapper">
                  <template v-if="searchedResult && searchedResult.length">
                    <li class="suggest-item flex-horizontal-nowrap flex-vertical-center" v-for="(song, index) in searchedResult" :key="'song' + song.id" @click="handleSearchItem(song.id, index)">
                      <i class="iconfont icon-185068musicnotestreamline"></i>
                      <p class="ellipsis">{{ song.name }}-{{ song.artists | formatArtists }}</p>
                    </li>
                  </template>
                </ul>
              </div>
              <loading v-if="isShowLoading"></loading>
              <no-result v-if="isShowNoReuslt"></no-result>
            </div>
            <!-- 搜索结果 end -->
            <div class="play-search-history-wrap">
              <div class="tab-wrap">
                <ul class="tab flex-horizontal">
                  <li class="tab-item" @click="tabIndex = 0" :class="{active: tabIndex === 0}">最近播放</li>
                  <li class="tab-item" @click="tabIndex = 1" :class="{active: tabIndex === 1}">搜索历史</li>
                </ul>
                <div class="tab-menus">
                  <div class="menu-item" v-show="tabIndex === 0">
                    <div class="played-list-wrapper" ref="recentPlayRef">
                      <div class="played-song-list">
                        <ul v-if="playHistory && playHistory.length">
                          <li class="item flex-vertical flex-horizontal-center" :key="song.songId" v-for="song in playHistory" @click="handlePlayHistorySong(song)">
                            <h2 class="name">{{ song.name }}</h2>
                            <p class="description ellipsis">{{ song.singer }}</p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="menu-item" v-show="tabIndex === 1">
                    <div class="searched-keywords-wrap" ref="searchHistoryRef">
                      <div class="searched-keywords">
                        <ul>
                          <template v-if="searchHistory.length">
                            <li v-for="(history, index) in searchHistory" :key="history + index" class="item flex-horizontal flex-vertical-center flex-horizontal-justify">
                              <span @click.stop="keywords = history">{{ history }}</span>
                              <i class="iconfont icon-chacha" @click.capture.prevent="removeSingleSearchHistory(history)"></i>
                            </li>
                          </template>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
        <!-- 添加歌曲到列表 end -->
      </div>
    </transition>
    <!-- 播放列表 end-->
    <!-- 顶部提示框 begin -->
    <transition enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp">
      <div class="top-tip-wrapper" v-show="isShowTopTip">
        <div class="top-tip" :class="{success: topTipStatus === 'success', warning: topTipStatus === 'warning', danger: topTipStatus === 'danger'}">
          <i class="iconfont status" :class="{'icon-hook': topTipStatus === 'success', 'icon-chacha': (topTipStatus === 'warning' || topTipStatus === 'danger')}"></i>
          <span class="text">{{ topTipMessage[topTipStatus] }}</span>
        </div>
      </div>
    </transition>
    <!-- 顶部提示框 end -->
    <!-- 播放列表 end :muted="isMuted"-->
    <audio id="audio"  :src="currentSong.songUrl" @ended="handleAudioEnd" preload="auto" @timeupdate="handleTimeupdate" @canplay="handleCanplay" @error="handlePlayError" ref="audio">
      您的浏览器暂不支持此播放器
    </audio>
  </div>
</template>
<script>
import { addZero, throttle, randomNum, debounce, trim } from '@/utils'
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
import { search } from '@/api'
import { formatArtists } from '@/filters'
import Loading from '@/components/base/loading.vue'
import NoResult from '@/components/base/no-result/no-result.vue'
import BScroll from 'better-scroll'
// 记录同一首歌曲播放错误次数
let ERROR_TIMES = 0
// 记录上一次播放错误的歌曲ID
let LAST_ERROR_SONG_ID = 0
export default {
  name: 'player',
  data () {
    return {
      isShow: false,
      // 手指触摸起始位置
      startPoint: 0,
      // 手指抬起位置
      endPoint: 0,
      // 标识滑动方向(0代表可以左滑)
      direction: 0,
      // 当前歌词索引
      currentLyric: 0,
      // 当前播放时间
      currentTime: null,
      // 歌曲总时间
      duration: 0,
      progressRef: null,
      progressBtnRef: null,
      lyricWrapperRef: null,
      mdrRef: null,
      // 记录歌词开始运动的起始index
      startIndex: null,
      // 记录歌词容器开始的offsetTop
      startOffsetTop: 0,
      // 是否需要重新计算startIndex(歌词开始滚动的那行p元素的索引)
      isRequireRecalcStartIndex: true,
      progressStartPoint: 0,
      progressEndPoint: 0,
      progressStartOffsetLeft: 0,
      progressLeft: 0,
      // 是否高亮歌词
      isHighlight: true,
      // 标识是否正在拖拽状态
      isDraging: false,
      // 是否显示播放列表
      isShowPlayList: false,
      // 是否显示添加歌曲到播放列表的框
      isShowAddSongToPlaylist: false,
      // 搜索结果
      searchedResult: [],
      // 搜索关键字
      keywords: '',
      // tab的索引
      tabIndex: 0,
      // 是否显示
      isShowTopTip: null,
      topTipStatus: 'success',
      topTipMessage: {
        'success': '1首歌曲已经添加到播放列表',
        'warning': '歌曲已存在于播放列表中',
        'danger': '添加失败，歌曲错误'
      },
      // 是否点击的歌曲，是同一个关键词搜索出来的（关键词没变化过）
      searchedSongPlayingIndex: -1,
      // 标识歌曲是否可以播放
      canPlayed: true,
      isShowLoading: false,
      isShowNoReuslt: false,
      isMuted: true
    }
  },
  mounted () {
    this.audio = this.$refs['audio']
    console.log('this.audio:', this.audio)
  },
  methods: {
    ...mapMutations(['setPlayStatus', 'setFullScreen', 'setCurrentSong', 'setCurrentSongIndex', 'replacePlayList', 'removeSongFromPlayList', 'addSongToPlayList', 'addSearchHistory', 'removeSearchHistory', 'addToPlayHistory', 'setSHowPlayer', 'addToMyFavorite', 'removeFromMyFavorite', 'setContinuePlay', 'setPlayModeIndex']),
    ...mapActions(['analyzeLyric', 'getSongInfo', 'updateSongInfo']),
    // 播放音乐
    play (song) {
      if (song && song.songId) {
        // 分析歌词
        this.analyzeLyric(song.lyric)
        // 开启播放状态
        this.playedStatus()
        // 播放音乐
        this.audio.play()
      }
    },
    pause () {
      this.audio.pause()
    },
    // 播放暂停切换
    togglePlay () {
      let audio = this.audio
      let statue = this.isPlaying
      statue ? audio.pause() : audio.play()
      this.setPlayStatus(!statue)
    },
    // 设置暂停的状态
    stoppedStatus () {
      this.setPlayStatus(false)
    },
    // 设置播放的状态
    playedStatus () {
      this.setPlayStatus(true)
      if (this.isShowPlayList === false) {
        this.setSHowPlayer(true)
      }
    },
    handleStart (e) {
      let touchPoint = e.changedTouches[0]
      this.startPoint = {
        pageX: touchPoint.pageX,
        pageY: touchPoint.pageY
      }
    },
    handleMove (e) {

    },
    handleEnd (e) {
      let touchPoint = e.changedTouches[0]
      this.endPoint = {
        pageX: touchPoint.pageX,
        pageY: touchPoint.pageY
      }
      let distance = this.endPoint.pageX - this.startPoint.pageX
      // 滑动方向，1右，0左
      let slideDriection = distance > 0 ? 0 : 1
      if (this.direction !== slideDriection) {
        if (Math.abs(distance) > 50) {
          this.isShow = !this.isShow
          this.direction = slideDriection
        }
      }
    },
    handleBarStart (e) {
      this.progressStartPoint = e.changedTouches[0].clientX
      this.progressStartOffsetLeft = window.parseInt(window.getComputedStyle(this.$refs.ps).getPropertyValue('width'))
    },
    handleBarMove (e) {
      this.isDraging = true
      this.progressEndPoint = e.changedTouches[0].clientX
      let distance = this.progressEndPoint - this.progressStartPoint
      let left = this.progressStartOffsetLeft + distance
      // progress实际总宽度
      let realProgressTotalWidth = (1 - this.progressBtnRef.getBoundingClientRect().width / 2 / this.progressRef.getBoundingClientRect().width) * this.progressRef.getBoundingClientRect().width
      if (left <= 0) {
        left = 0
      } else {
        if (left >= realProgressTotalWidth) {
          left = realProgressTotalWidth
        }
      }
      this.$refs.ps.style.width = left + 'px'
      this.$refs.progressBtnWrapper.style.transform = 'translate3d(' + left + 'px, 0, 0)'
      this.newTime = left ? (left / realProgressTotalWidth) * this.audio.duration : left
      let times = this.getTime
      // 设置当前歌词位置
      for (let k = 0; k < times.length; k++) {
        if (times[k] <= this.newTime * 1000 && this.newTime * 1000 < times[k + 1]) {
          console.log('设置新的currentLyric:', k)
          this.currentLyric = k
          break
        }
      }
      this.currentTime = this.newTime
    },
    handleBarEnd (e) {
      this.audio.currentTime = this.newTime
      this.isDraging = false
    },
    // 初始化播放器状态
    init (isSetStatus) {
      this.currentLyric = 0
      this.currentTime = 0
      if (this.lyricWrapperRef) {
        this.lyricWrapperRef.style.transform = 'translate3d(0, 0, 0)'
      }
      if (this.$refs.ps) {
        this.$refs.ps.style.width = 0
      }
      if (this.$refs.progressBtnWrapper) {
        this.$refs.progressBtnWrapper.style.transform = 'translate3d(0, 0, 0)'
      }
      this.startIndex = null
      this.isRequireRecalcStartIndex = true
    },
    // 歌曲播放时间变化事件
    // 改变currentTime的值就可以实现快进
    handleTimeupdate: throttle(function () {
      let now = this.currentTime = this.isDraging ? this.currentTime : this.audio.currentTime
      // 处理 歌词同步
      let timeAry = this.getTime
      let currentMs = now * 1000
      // console.log('currentMs:', currentMs)
      // 标识是否滚动歌词
      let isMove = false
      // 高亮歌词 begin
      if (this.isHighlight) {
        let condition = false
        for (let i = this.currentLyric; i < timeAry.length; i++) {
          if (i < timeAry.length - 1) {
            if (timeAry[i] <= currentMs && currentMs < timeAry[i + 1]) {
              condition = this.isDraging ? true : this.currentLyric !== i
              if (condition) {
                isMove = true
                this.currentLyric = i
              }
              break
            }
          } else {
            if (timeAry[i] <= currentMs) {
              condition = this.isDraging ? true : this.currentLyric !== i
              if (condition) {
                isMove = true
                this.currentLyric = i
              }
              break
            }
          }
        }
      }
      // 高亮歌词 end
      // 滚动条歌词
      if (this.getLyrics && this.getLyrics.length && isMove && this.lyricWrapperRef) {
        let pElementAry = this.lyricWrapperRef.querySelectorAll('p')
        // 当前歌词索引
        let nowIndex = this.currentLyric
        // 当前歌词的offsetTop
        let currentP = pElementAry[this.currentLyric]
        let currentOffsetTop = currentP.offsetTop
        let middleRightHeight = this.mdrRef.getBoundingClientRect().height
        // 当前歌词离它父元素的顶部距离是否超过了歌词容器的一半
        let isHalf = Math.round(currentOffsetTop / middleRightHeight)
        // 真正开始滚动的那行p元素
        // let realStartPElement = null
        // 将累加（使用柯里化累加），到最后一次才执行
        isHalf = this.isDraging ? true : isHalf
        if (isHalf) {
          let p = null
          // 找到真正开始滚动的那行歌词的位置，纠正startIndex
          if (this.isRequireRecalcStartIndex) {
            // 设置默认的刚开始滚动的索引
            this.startIndex = this.currentLyric - 1
            while ((p = pElementAry[--nowIndex])) {
              if (Math.round(p.offsetTop / middleRightHeight)) {
                // realStartPElement = p
                // 不算当前行,所以不计算
                this.startIndex = nowIndex - 1
                this.isRequireRecalcStartIndex = false
              } else {
                break
              }
            }
          }
          let sum = 0
          for (let j = this.startIndex; j < this.currentLyric; j++) {
            sum += window.parseInt(window.getComputedStyle(pElementAry[j]).getPropertyValue('height'))
          }
          // console.log('sum:' + sum)
          this.lyricWrapperRef.style.transform = 'translate3d(0, -' + sum + 'px, 0)'
        }
      }
    }, 200),
    // audio.volume 改变音量
    // 歌曲加载完成事件(是否可以播放事件)
    handleCanplay (e) {
      this.duration = this.audio.duration
      this.canPlayed = true
      LAST_ERROR_SONG_ID = 0
      ERROR_TIMES = 0
    },
    // 播放完成事件
    handleAudioEnd (e) {
      console.log('歌曲播放完了……')
      this.playByplayMode(this.playModeIndex)
    },
    handlePlayError (e) {
      console.log('歌曲错误了：', e)
      // debugger
      this.setPlayStatus(false)
      this.canPlayed = false
      // 如果当前歌曲不可播放，则请求新的URL地址，如果连续三次播放失败，则跳转下一首。
      if (this.currentSong.songId === LAST_ERROR_SONG_ID && ERROR_TIMES >= 2) {
        console.log('歌曲报错3次后，根据当前播放模式决定播放哪首')
        ERROR_TIMES = 0
        LAST_ERROR_SONG_ID = 0
        let playMode = this.playMode[this.playModeIndex]
        console.log('playMode:', playMode)
        this.playNextSong()
      } else {
        if (ERROR_TIMES >= 1 && ERROR_TIMES < 3) {
          this.playCurrentSong(true)
        }
      }
      ++ERROR_TIMES
      LAST_ERROR_SONG_ID = this.currentSong.songId
    },
    // 根据播放模式播放歌曲
    playByplayMode (playModeIndex) {
      switch (this.playMode[playModeIndex]) {
        // 单曲循环
        case 'loop':
          console.log('单曲循环')
          this.playCurrentSong()
          break
        // 顺序播放
        case 'order':
          console.log('顺序播放')
          this.playNextSong()
          break
        // 随机播放
        case 'random':
          console.log('随机播放')
          this.playMusicRandom()
          break
        // 列表循环
        default:
          console.log('列表循环')
          this.playNextSong(true)
          break
      }
    },
    // 根据索引，播放播放列表里的歌曲
    playMusicInPlayList (index, cb) {
      this.setCurrentSongIndex(index)
      let songObj = this.getPlayList[index]
      // 1、获取歌曲信息
      // 首选判断这个对象有木有歌曲信息（songUrl和name）
      // 如果有，则直接走老逻辑。
      // 如果没有，则获取歌曲信息(this.getSongInfo(songId))
      // 是否是完整的歌曲信息
      let isSongInfoReady = songObj.songId && (songObj.name || songObj.singer || songObj.picUrl) && (typeof songObj.songUrl !== 'undefined')
      if (!isSongInfoReady && songObj.songId) {
        this.getSongInfo(songObj.songId).then(songInfo => {
          // 响应式的替换playList里面索引为index的数据
          for (let song in songInfo) {
            this.$set(songObj, song, songInfo[song])
          }
          // debugger
          // 如果能播放，则使用vuex里面的URL
          // 如果播放出错，则获取线上最新的URL
          this.choosePlayType(songObj, cb)
        }).catch(error => {
          throw error
        })
      } else {
        this.choosePlayType(songObj, cb)
      }
    },
    choosePlayType (songObj, cb) {
      if (!this.canPlayed) {
        console.log('尝试获取新的URL链接……')
        this.updateSongInfo(songObj).then(songObj => {
          // debugger
          if (!(songObj instanceof Error)) {
            this.setCurrentSong(songObj)
            console.log('重新获取线上的URL播放：', songObj)
          } else {
            throw songObj
          }
          cb && cb()
        })
      } else {
        console.log('直接使用本地URL播放咯……')
        if (this.playMode[this.playModeIndex] === 'loop') {
          this.setCurrentSong(songObj)
        } else {
          this.setCurrentSong(songObj)
        }
        cb && cb()
      }
    },
    // 点击播放列表中的歌曲执行播放
    handlePlayListSong (songId) {
      if (songId === this.currentSong.songId) {
        this.togglePlay()
        return
      }
      let index = 0
      for (let i = 0; i < this.getPlayList.length; i++) {
        let item = this.getPlayList[i]
        if (item.songId === songId) {
          index = i

          break
        }
      }
      this.playMusicInPlayList(index)
    },
    // 播放当前歌曲
    playCurrentSong (notInit) {
      this.playMusicInPlayList(this.currentSongIndex, () => {
        console.log('单曲循环初始化了……')
        if (!notInit) {
          this.init()
        }
      })
    },
    // 播放上一首
    /**
     * loop 代表是否循环列表播放
     */
    playPrevSong (loop) {
      let maxIndex = this.getPlayList.length - 1
      let index = 0
      if (this.currentSongIndex <= 0) {
        if (loop) {
          index = maxIndex
        } else {
          if (this.isPlaying) {
            this.stoppedStatus()
            this.$nextTick().then(() => {
              this.init()
            })
          }
          return
        }
      } else {
        index = this.currentSongIndex - 1
      }
      this.playMusicInPlayList(index)
    },
    // 播放下一首
    /**
     * loop 代表是否循环列表播放
     */
    playNextSong (loop) {
      let maxIndex = this.getPlayList.length - 1
      let index = 0
      if (this.currentSongIndex >= maxIndex) {
        if (loop) {
          index = 0
        } else {
          if (this.isPlaying) {
            this.stoppedStatus()
            this.$nextTick().then(() => {
              this.init()
            })
          }
          return
        }
      } else {
        index = this.currentSongIndex + 1
      }
      this.playMusicInPlayList(index)
    },
    // 随机播放音乐
    playMusicRandom () {
      let maxIndex = this.getPlayList.length
      let randomIndex = -1
      // 防止两次索引相同，无法触发watch里面的currentSong函数
      do {
        randomIndex = randomNum(0, maxIndex)
        console.log('randomIndex:', randomIndex)
      } while (randomIndex === this.currentSongIndex)
      this.playMusicInPlayList(randomIndex)
    },
    // 切换播放模式
    togglePlayMode () {
      // 取余操作，由于数组索引从0开始，所以需要加一
      let index = this.playModeIndex + 1
      let modeLength = this.playMode.length
      // 余数
      let remaining = (++index) % modeLength
      if (remaining === 0) {
        this.setPlayModeIndex(modeLength - 1)
      } else {
        this.setPlayModeIndex(remaining - 1)
      }
    },
    removeMusicFromPlayList (songId) {
      if (songId) {
        this.removeSongFromPlayList(songId)
        if (this.isContinuePlay) {
          this.updateSongInfo(this.getPlayList[this.currentSongIndex]).then(songObj => {
            this.setCurrentSong(songObj)
          })
          this.setContinuePlay(false)
        }
      }
    },
    handleSearch: debounce(function () {
      let keyword = trim(this.keywords)
      if (keyword) {
        if (this.searchedResult.length) {
          this.searchedResult = []
        }
        this.isShowLoading = true
        search(keyword).then(response => {
          this.isShowLoading = false
          if (response.code === 200) {
            let result = response.result
            if (result.songs && result.songs.length) {
              this.searchedResult = result.songs
            }
            if (!this.searchedResult.length) {
              this.isShowNoReuslt = true
            }
          }
        }).catch(error => {
          this.isShowLoading = false
          throw error
        })
      }
      this.searchedSongPlayingIndex = -1
    }, 500),
    clearKeywords () {
      this.keywords = ''
    },
    handleSearchItem (songId, index) {
      let isSameKeywords = true
      if (this.searchedSongPlayingIndex === -1) {
        isSameKeywords = false
      }
      this.getSongInfo(songId).then(songInfo => {
        console.log('songInfo:', songInfo)
        this.searchedSongPlayingIndex = index
        if (songInfo) {
          songInfo['isUnchangeIndex'] = true
          // 添加歌曲到播放列表
          this.addSongToPlayList(songInfo)
          this.isShowTopTip = true
          if (this.isNewSongId) {
            this.topTipStatus = 'success'
          } else {
            this.topTipStatus = 'warning'
          }
        } else {
          this.topTipStatus = 'error'
        }
      })
      // 添加歌曲信息到搜索历史记录
      if (!isSameKeywords) {
        // 存储搜索历史
        this.addSearchHistory(this.keywords)
      }
    },
    removeSingleSearchHistory (keyword) {
      if (typeof keyword !== 'undefined') {
        // 删除单条搜索记录
        this.removeSearchHistory(keyword)
      }
    },
    handlePlayHistorySong (songInfo) {
      this.addSongToPlayList(songInfo)
      this.isShowTopTip = true
      if (this.isNewSongId) {
        this.topTipStatus = 'success'
      } else {
        this.topTipStatus = 'warning'
      }
    },
    // 切换喜欢的状态
    toggleLikeStatus (song) {
      // 如果传入进来的是true，则从数组中删除
      if (song.isLike) {
        this.removeFromMyFavorite(song)
      } else {
        this.addToMyFavorite(song)
      }
      this.$set(song, 'isLike', !song.isLike)
    }
  },
  filters: {
    formatTime (second) {
      var m = 0
      if (second > 60) {
        m = parseInt(second / 60)
      }
      var s = addZero(parseInt(second % 60))
      return addZero(m) + ':' + s
    },
    formatArtists
  },
  computed: {
    ...mapState({
      getLyrics: state => state.lyric,
      getTime: state => state.time,
      currentSong: state => state.currentSong,
      isFullScreen: state => state.isFullScreen,
      isSHowPlayer: state => state.isSHowPlayer,
      getPlayList: state => state.playList,
      currentSongIndex: state => state.currentSongIndex,
      isNewSongId: state => state.isNewSongId,
      searchHistory: state => state.searchHistory,
      playHistory: state => state.playHistory,
      isContinuePlay: state => state.isContinuePlay,
      playMode: state => state.playMode,
      playModeIndex: state => state.playModeIndex
    }),
    ...mapGetters(['isPlaying', 'getFavoriteStatus']),
    // 实时计算进度条
    calcPlayPercent () {
      if (this.progressRef && this.progressBtnRef && !this.isDraging) {
        let progressDom = this.progressRef
        let progressBtnDom = this.progressBtnRef
        let progressDomWidth = progressDom.getBoundingClientRect().width
        let progressBtnDomWidth = progressBtnDom.getBoundingClientRect().width
        let ratio = 100 * (1 - progressBtnDomWidth / 2 / progressDomWidth) * (this.currentTime / this.duration)
        let progressBtnWrapperDom = this.$refs['progressBtnWrapper']
        if (progressBtnWrapperDom) {
          progressBtnWrapperDom.style.transform = 'translate3d(' + ratio / 100 * progressDomWidth * (1 - progressBtnDomWidth / 2 / progressDomWidth) + 'px, 0, 0)'
        }
        return 'width:' + (ratio || 0) + '%'
      }
    }
  },
  watch: {
    isPlaying: function (val) {
      if (val === false) {
        this.pause()
      }
    },
    isFullScreen: function (val) {
      if (val === true && !this.progressRef && !this.progressBtnRef) {
        this.progressRef = this.$refs.progress
        this.progressBtnRef = this.$refs.progressBtn
      }
    },
    isShow: function (val) {
      if (val === true && !this.lyricWrapperRef) {
        this.mdrRef = this.$refs.mdr
        console.log('this.mdrRef', this.$refs.mdr)
        this.lyricWrapperRef = this.$refs.lyricWrapper
      }
    },
    currentSong: function (newSong, oldSong) {
      this.$nextTick(() => {
        this.init()
        if (newSong) {
          this.play(newSong)
          // 记录播放历史
          this.addToPlayHistory(newSong)
        } else {
          if (this.isPlaying) {
            this.stoppedStatus()
          }
        }
      })
    },
    keywords: function (newKeywords) {
      this.handleSearch(newKeywords)
      if (this.isShowNoReuslt) {
        this.isShowNoReuslt = false
      }
    },
    isShowTopTip: function (status) {
      if (status !== null) {
        setTimeout(() => {
          this.isShowTopTip = null
        }, 2000)
      }
    },
    isShowPlayList: function (bool) {
      // debugger
      if (bool === true) {
        this.$nextTick().then(() => {
          if (!this.playListScroll || this.playListScroll.destroyed) {
            this.playListScroll = new BScroll(this.$refs['playListRef'], {click: true, stopPropagation: true})
          } else {
            this.playListScroll.refresh()
            console.log('this.$refs["playItem"][this.currentSongIndex]', this.$refs['playItem'][this.currentSongIndex])
          }
          this.playListScroll.scrollToElement(this.$refs['playItem'][this.currentSongIndex])
        })
      } else {
        this.playListScroll && this.playListScroll.destroy()
      }
    },
    isShowAddSongToPlaylist: function (isShow) {
      if (isShow === true) {
        this.$nextTick().then(() => {
          if (!this.recentScroll || this.recentScroll.destroyed) {
            this.recentScroll = new BScroll(this.$refs.recentPlayRef, {click: true, stopPropagation: true})
          } else {
            this.recentScroll && this.recentScroll.refresh()
          }
        })
      } else {
        this.recentScroll && this.recentScroll.destroy()
        this.searchHistoryScroll && this.searchHistoryScroll.destroy()
      }
    },
    tabIndex: function (index) {
      if (index === 1) {
        this.$nextTick().then(() => {
          if (!this.searchHistoryScroll || this.searchHistoryScroll.destroyed) {
            this.searchHistoryScroll = new BScroll(this.$refs.searchHistoryRef, {click: true, stopPropagation: true})
          } else {
            this.searchHistoryScroll && this.searchHistoryScroll.refresh()
          }
        })
      }
    },
    canPlayed: function (status) {
      // debugger
      console.log('status:', status)
      if (!status) {
        // 播放当前歌曲
        this.playCurrentSong(true)
      }
    },
    currentSongIndex: function (val) {
      console.log('currentSong变化了', val)
      if (this.isShowPlayList && this.playListScroll) {
        console.log('执行滚动')
        this.playListScroll.scrollToElement(this.$refs['playItem'][val])
      }
    }
  },
  components: {
    Loading,
    NoResult
  }
}
</script>
<style lang="less" scoped>
/*音乐播放器*/
.mini-player {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 60px;
  z-index: 199304140957;
  background: #333;
  .song-info {
    flex: 1;
  }
  .song-img {
    flex: 0 0 40px;
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin: 0 10px 0 20px;
  }
  .text {
    // 这里如果不设置overflow:hidden;子元素的溢出省略号无法显示
    overflow: hidden;
    flex: 1;
  }
  .song-name {
    margin-bottom: 2px;
    font-size: 14px;
    color: #fff;
  }
  .singer {
    color: hsla(0,0%,100%,.3);
    font-size: 12px;
  }
  .control {
    width: 74px;
    flex: 0 0 74px;
    margin: 0 10px;
    color: rgba(255,205,49,.5);
    font-size: 32px;
    &>i {
      font-size: inherit;
    }
  }
}
.cd img,
.song-img {
  transform:translate3d(0,0,0);
  &.playing {
    animation: circle 3s linear infinite;
  }
}
@keyframes circle {
  from {
    transform: rotate(0)
  }
  to {
    transform: rotate(360deg)
  }
}
/*音乐播放器*/
/*normal-player*/
.normal-player {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 199304140958;
  color: #fff;
  background: #222;
  // display: none;

  .bg-img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    opacity: .6;
    filter: blur(20px)
  }
  .top {
    position: relative;
    z-index: 1;
    text-align: center;
    .title {
      width: 70%;
      height: 42px;
      margin: 0 auto;
      line-height: 42px;
      font-size: 18px;
      font-weight: 400;
    }
    .singer-name {
      font-size: 14px;
    }
  }
  .middle {
    position: fixed;
    top: 80px;
    bottom: 170px;
    width: 100%;
    font-size: 0;
    white-space: nowrap;
    .middle-left {
      position: relative;
      width: 100%;
      height: 0;
      padding-top: 80%;
      vertical-align: top;
    }
    .cd-wrap {
      position: absolute;
      left: 10%;
      top: 0;
      width: 80%;
      height: 100%;
      .cd {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 10px solid hsla(0,0%,100%,.1);
        }
      }
    }
    .mini-lyric-wrapper {
      width: 80%;
      margin: 10px auto 0;
      overflow: hidden;
      text-align: center;
      .mini-lyric {
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        color: hsla(0,0%,100%,.5);
      }
    }
    .middle-right {
      width: 100%;
      height: 100%;
      overflow: hidden;
      .lyric-wrapper {
        width: 80%;
        min-height: 100%;
        margin: 0 auto;
        text-align: center;
        transition: transform 0.1s;
        transform: translate3d(0, 0, 0);
        overflow: hidden;
      }
      .text {
        min-height: 32px;
        line-height: 32px;
        color: hsla(0,0%,100%,.5);
        font-size: 14px;
        margin: 0 0;
        box-sizing: content-box;
        white-space: normal;
        word-break: break-word;
        &.current {
          color: #fff;
        }
      }
    }
    .middle-left,
    .middle-right {
      display: inline-block;
    }
  }
  .foot {
    position: absolute;
    bottom: 30px;
    width: 100%;
    .operators {
      width: 80%;
      margin: 0 auto;
      & > div {
        flex: 1;
        &.right {
          text-align: right;
        }
        &.center {
          text-align: center;
        }
      }
      i {
        font-size: 40px;
        &.play {
          font-size: 45px;
        }
        &.mode {
          font-size: 32px;
        }
      }
    }
  }
}
.dots {
  position: relative;
}
.progress-wrapper {
  height: 30px;
  width: 80%;
  margin: 0 auto;
  .progress-bar-wrapper {
    flex: 1;
    height: 4px;
    background: rgba(0, 0, 0, 0.3)
  }
  .progress-bar-inner {
    position: relative;
    height: 100%;
    .progress {
      position: absolute;
      left: 0;
      width: 0;
      height: 100%;
      background: #ffcd32;
      // transition: width 0.1s
    }
  }
  .progress-btn-wrapper {
    position: absolute;
    left: -8px;
    top: -13px;
    width: 30px;
    height: 30px;
    .progress-btn {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 3px solid #fff;
      background: #ffcd32;
      transform: translateZ(0)
    }
  }
  .playing-time,
  .endtime {
    font-size: 12px;
    flex: 0 0 35px;
  }
  .endtime {
    text-align: right;
  }
}
// 定义左侧动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity .5s
}
.fade-enter,
.fade-leave-to {
  opacity: 0
}
img.playing.pause {
  animation-play-state: paused;
}
.played {
  animation-play-state: running;
}
/*=== 播放列表begin ===*/
.playlist-wrap {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 199304140959;
  background-color: rgba(0, 0, 0, .3);
  .playlist {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    background: #333;
    .list {
      max-height: 240px;
      overflow: hidden;
    }
  }
  .playlist-item {
    height: 40px;
    padding: 0 30px 0 20px;
    overflow: hidden;
    .song-name-wrap {
      flex: 1;
      overflow: hidden;
      & > span {
        margin-right: 5px;
        flex-basis: 16px;
      }
      .text {
        color: hsla(0,0%,100%,.3);
        font-size: 14px;
        flex: 1;
      }
    }
    .opreate {
      .like-icon-wrap {
        margin-right: 5px;
      }
    }
    [class^=iconfont] {
      font-size: 20px;
    }
  }
  .add-to-playlist {
    width: 140px;
    margin: 20px auto 30px;
    .add {
      box-sizing: content-box;
      padding: 8px 16px;
      border: 1px solid hsla(0,0%,100%,.5);
      border-radius: 50px;
      color: hsla(0,0%,100%,.5);
      font-size: 12px;
    }
    .icon-add {
      color: hsla(0,0%,100%,.5);
    }
  }
  .close-list {
    text-align: center;
    line-height: 50px;
    background: #222;
    font-size: 16px;
    color: hsla(0,0%,100%,.5);

  }
}
/*=== 播放列表end ===*/

/**=== 添加歌曲到列表 begin ===**/
.playlist-add-wrapper {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #222;
  color: #fff;
  z-index: 199304140960;
  font-weight: 400;
  .close-btn {
    position: absolute;
    top: 5px;
    right: 10px;
    font-size: 30px;
  }
  .title {
    width: 80%;
    margin: 0 10%;
    text-align: center;
    font-size: 18px;
    line-height: 44px;
    font-weight: 400;
  }
}
.play-search-history-wrap {
  .tab-wrap {
    color: hsla(0,0%,100%,.3);
    .tab {
      width: 240px;
      margin: 0 auto;
      text-align: center;
      border: 1px solid #333;
      border-radius: 5px;
      .tab-item {
        flex: 1;
        font-size: 14px;
        padding: 8px 0;
        &.active {
          background: #333;
          color: #fff;
        }
      }
    }
  }
}
.played-song-list {
  padding: 20px 30px;
  .item {
    height: 64px;
    line-height: 20px;
    font-size: 14px;
    color: #fff;
    h2 {
      font-size: inherit;
      font-weight: 400;
      margin: 0;
    }
    .description {
      font-size: 12px;
      color: hsla(0,0%,100%,.3);
      margin: 4px 0;
    }
  }
}

/**=== 搜索 begin ===**/

.search-wrap {
  margin: 20px;
  .search {
    width: 100%;
    height: 40px;
    padding: 0 6px;
    background: #333;
    border-radius: 6px;
    & > i {
      color: #222;
      font-size: 22px;
    }
    .search-content {
      flex: 1;
      margin: 0 6px;
      line-height: 18px;
      font-size: 14px;
      border: none;
      outline: 0;
      background: #333;
      color: #fff;

    }
  }
}
.searched-keywords {
  padding: 20px 30px;
  .item {
    height: 40px;
    overflow: hidden;
    & > span  {
      display: block;
      height: 100%;
      padding-right: 3px;
      line-height: 40px;
      &:first-child {
        flex: 1;
      }
    }
  }
}
.search-result-wrapper {
  position: fixed;
  top: 114px;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 10px 30px 0;
  background: #222;
  overflow: hidden;
  z-index: 1;
}
.suggest-item-wrapper {
  .suggest-item {
    padding-bottom: 20px;
    color: hsla(0,0%,100%,.3);
    & > i {
      margin-right: 14px;
      color: inherit;
    }
    & > p {
      margin: 0;
      font-size: 14px;

    }
  }
}
/**=== 搜索 end ===**/
/**=== 添加歌曲到列表 end ===**/
/**=== 顶部提示框 begin ===**/
.top-tip-wrapper {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 199304140961;
  color: #fff;
  .top-tip {
    text-align: center;
    padding: 18px 0;
    font-size: 14px;
    background: #666;
    &.success {
      background-color: #5cb85c;
      border-color: #4cae4c;
    }
    &.warning {
      background-color: #f0ad4e;
      border-color: #eea236;
    }
    &.danger {
      background-color: #d9534f;
      border-color: #d43f3a;
    }
    .status {
      font-size: 14px;
      color: #fff;
    }
  }
}
/**=== 顶部提示框 end ===**/
.played-list-wrapper,
.searched-keywords-wrap {
  position: fixed;
  top: 170px;
  bottom: 0;
  width: 100%;
  overflow: hidden;
}
</style>
