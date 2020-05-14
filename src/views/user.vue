<template>
  <transition enter-active-class="animated fadeInRight faster" leave-active-class="animated fadeOutRight faster">
    <div class="user-center">
      <div class="back" @click="$router.back()">
        <i class="iconfont icon-back"></i>
      </div>
      <div class="tab-wrapper">
        <ul class="tab flex-horizontal">
          <li class="tab-item" @click="tabIndex = 0" :class="{active: tabIndex === 0}">我喜欢的</li>
          <li class="tab-item" @click="tabIndex = 1" :class="{active: tabIndex === 1}">最近听的</li>
        </ul>
      </div>
      <div class="random-play-btn-wrapper">
        <div class="random-play-btn" @click.stop="playAllRandom">
          <i class="iconfont icon-play play-btn-icon"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="wrapper">
        <div class="tab-menus">
          <div class="menu-item" v-show="tabIndex === 0">
            <div class="songlist-wrapper" ref="favoriteRef" :style="'bottom:' + calcBottom ">
              <ul>
                <template v-if="myFavorite && myFavorite.length">
                  <li class="item flex-vertical flex-horizontal-center" :key="song.songId" v-for="song in myFavorite" @click.stop="handlePlay(song)">
                    <h2 class="name">{{ song.name }}</h2>
                    <p class="singer">{{ song.singer }}</p>
                  </li>
                </template>
              </ul>
            </div>
          </div>
          <div class="menu-item" v-show="tabIndex === 1">
            <div class="songlist-wrapper" ref="recentListenRef" :style="'bottom:' + calcBottom ">
              <ul>
                <template v-if="playHistory && playHistory.length">
                  <li class="item flex-vertical flex-horizontal-center" :key="song.songId" v-for="song in playHistory" @click.stop="handlePlay(song)">
                    <h2 class="name">{{ song.name }}</h2>
                    <p class="singer">{{ song.singer }}</p>
                  </li>
                </template>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import { mapMutations, mapState, mapActions, mapGetters } from 'vuex'
import BScroll from 'better-scroll'
export default {
  data () {
    return {
      tabIndex: 0
    }
  },
  mounted () {
    setTimeout(() => {
      this.favoriteScroll = new BScroll(this.$refs.favoriteRef, {click: true, stopPropagation: true})
    }, 20)
  },
  methods: {
    handlePlay (songObj) {
      if (typeof songObj === 'object') {
        this.updateSongInfo(songObj).then(result => {
          this.setCurrentSong(songObj)
          this.addSongToPlayList(songObj)
        })
      }
    },
    playAllRandom () {
      let musicList = null
      // 我喜欢的
      if (this.tabIndex === 0) {
        musicList = this.myFavorite
      } else if (this.tabIndex === 1) {
        musicList = this.playHistory
      }
      this.playAllMusicRandom(musicList).then(songInfo => {
        console.log('随机播放所有的是:', this.tabIndex ? '播放历史' : '我喜欢的', songInfo)
        this.setCurrentSong(songInfo)
      })
    },
    ...mapMutations(['setCurrentSong', 'addSongToPlayList', 'replacePlayList']),
    ...mapActions(['beginPlay', 'updateSongInfo', 'playAllMusicRandom'])
  },
  computed: {
    ...mapState({
      playHistory: state => state.playHistory,
      myFavorite: state => state.myFavorite
    }),
    ...mapGetters(['calcBottom'])
  },
  watch: {
    tabIndex (index) {
      if (index === 1) {
        this.$nextTick().then(() => {
          if (!this.listenScroll) {
            this.listenScroll = new BScroll(this.$refs.recentListenRef, {click: true, stopPropagation: true})
          } else {
            this.listenScroll && this.listenScroll.refresh()
          }
        })
      }
    },
    calcBottom: function (newValue) {
      this.$nextTick(() => {
        console.log('user组件BScroll刷新啦')
        this.favoriteScroll && this.favoriteScroll.refresh()
        this.listenScroll && this.listenScroll.refresh()
      })
    }
  },
  destroyed () {
    this.listenScroll && this.listenScroll.destroy()
    this.favoriteScroll && this.favoriteScroll.destroy()
  }
}
</script>
<style lang="less" scoped>
.user-center {
  width: 100%;
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 100;
  background: #222;
}
.tab-wrapper {
  margin: 10px 0 30px;
}
.tab {
  width: 240px;
  margin: 0 auto;
  text-align: center;
  border: 1px solid #333;
  border-radius: 5px;
  color: hsla(0,0%,100%,.3);
}
.tab-item {
  flex: 1;
  font-size: 14px;
  padding: 8px 0;
  &.active {
    background: #333;
    color: #fff;
  }
}
.random-play-btn {
  width: 135px;
  padding: 7px 0;
  margin: 0 auto;
  text-align: center;
  border: 1px solid hsla(0,0%,100%,.5);
  color: hsla(0,0%,100%,.5);
  border-radius: 100px;
  font-size: 0;
  & > .play-btn-icon,
  & > .text {
    display: inline-block;
    vertical-align: middle;
    font-size: 12px;
  }
  .play-btn-icon {
    margin-right: 6px;
    font-size: 16px;
    color: hsla(0,0%,100%,.5);
  }
}
.songlist-wrapper {
  position: absolute;
  top: 130px;
  bottom: 0;
  width: 100%;
  overflow: hidden;
  .item {
    height: 64px;
    font-size: 14px;
    .name {
      color: #fff;
      font-size: inherit;
      margin: 0;
    }
    .singer {
      color: hsla(0,0%,100%,.3)
    }
  }
}
.wrapper {
  padding: 20px 30px;
}
</style>
