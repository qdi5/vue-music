<template>
  <div class="song-list">
    <div class="top-header">
      <i class="iconfont icon-back" @click="$router.back(); $store.state.isFullScreen = false"></i>
      <div class="song-list-title ellipsis" ref="title">{{getTitle}}</div>
    </div>
    <div class="bg-image" ref="imageSection" v-if="allData" :style="'background-image: url(' + coverImgUrl +')'">
      <div class="play-wrapper">
        <div class="play" @click.stop="randomPlayAll">
          <i class="iconfont icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="mask"></div>
    </div>
    <div class="bg-layer" ref="bgLayer"></div>
    <div class="song-list-wrap" ref="songListWrap" :style="'bottom:' + calcBottom">
      <div class="wrapper">
        <template v-if="songListData && songListData.length">
          <div class="song-item" v-for="song in songListData" :key="song.id" @click="getSong(song.id)">
            <div class="song-name ellipsis">{{ song.name }}</div>
            <p class="song-singer ellipsis">{{ formatSingers(song.ar) }}</p>
          </div>
        </template>
      </div>
      <loading v-if="!songListData.length"></loading>
    </div>
  </div>
</template>
<script>
import BScroll from 'better-scroll'
import { extractSongInfo, formatSingers } from '@/utils/service.js'
import { hasClass, addClass, removeClass } from '@/utils/dom.js'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import Loading from '@/components/base/loading.vue'
import 'animate.css'
export default {
  props: {
    id: {
      type: String
    },
    // 接口获取的所有数据
    allData: {
      type: Object,
      default: null
    },
    // 从所有数据单独获取的歌曲列表数据
    songListData: {
      type: Array,
      default: null
    },
    coverImgUrl: {
      type: String,
      default: 'data:image/png;base64,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'
    }
  },
  mounted () {
    // debugger
    this.$nextTick().then(() => {
      let imageSectionHeight = 0
      let topHeight = 0
      let difference = 0
      let songListWrap = this.$refs['songListWrap']
      let imageSection = this.$refs.imageSection
      let title = this.$refs.title
      let bgLayer = this.$refs.bgLayer
      let playWrapper = imageSection.querySelector('.play-wrapper')
      this.BScroll = new BScroll(songListWrap, {
        click: true,
        probeType: 3,
        stopPropagation: true
      })
      this.BScroll.on('scroll', pos => {
        let translateY = pos.y.toFixed(4) * 1
        if (!imageSectionHeight || !topHeight) {
          imageSectionHeight = window.parseInt(window.getComputedStyle(imageSection).getPropertyValue('height'))
          topHeight = window.parseInt(window.getComputedStyle(title).getPropertyValue('height'))
          difference = imageSectionHeight - topHeight
        }
        if (translateY < 0) {
          let zIndex = imageSection.getAttribute('style')
          if (zIndex.search(/z-index|zIndex/g) !== -1) {
            imageSection.setAttribute('style', zIndex.replace(/(z-index|zIndex):\s*\d+\s*;?/g, ''))
          }
          // 当滚动的距离，小于image背景的高度时候
          if (translateY > -difference) {
            if (hasClass(imageSection, 'small')) {
              removeClass(imageSection, 'small')
            }
            if (playWrapper.style.display === 'none') {
              playWrapper.style.display = 'block'
            }
            bgLayer.style.transform = 'translate3d(0, ' + translateY + 'px, 0)'
          } else {
            // 当better-scroll滚动的高度大于等于image背景高度时
            // 设置bg-image的padding-top为0，高度为40px
            // 设置class为play-wrapper的div的display为none
            if (!hasClass(imageSection, 'small')) {
              addClass(imageSection, 'small')
            }
            if (playWrapper.style.display !== 'none') {
              playWrapper.style.display = 'none'
            }
            bgLayer.style.transform = 'translate3d(0, -' + difference + 'px, 0)'
          }
        } else {
          let isZero = translateY === 0
          console.log('translateY:', translateY)
          let ratio = isZero ? 1 : (imageSectionHeight + translateY) / imageSectionHeight
          bgLayer.style.transform = 'translate3d(0,' + translateY + 'px, 0)'
          console.log('ratio:', ratio)
          imageSection.style.transformOrigin = 'center top'
          imageSection.style.transform = 'scale(' + ratio + ')'
          imageSection.style.zIndex = isZero ? 0 : 10
        }
      })
    })
  },
  methods: {
    formatSingers,
    getSong (id) {
      this.beginPlay(Number(id)).then(songInfo => {
        if (songInfo) {
          this.setCurrentSong(songInfo)
          this.addSongToPlayList(songInfo)
        }
      })
    },
    randomPlayAll () {
      let musicList = this.songListData
      let songs = extractSongInfo(musicList)
      this.playAllMusicRandom(songs).then(songInfo => {
        console.log('随机播放所有啦：', songInfo)
        this.setCurrentSong(songInfo)
      })
    },
    ...mapMutations(['addSongToPlayList', 'setCurrentSong']),
    ...mapActions(['beginPlay', 'playAllMusicRandom'])
  },
  computed: {
    getTitle () {
      return this.$route.query.title
    },
    ...mapGetters(['calcBottom'])
  },
  watch: {
    calcBottom: function (newValue) {
      this.$nextTick(() => {
        this.BScroll && this.BScroll.refresh()
      })
    },
    songListData: function (data) {
      console.log('songListData:', data)
      this.BScroll && this.BScroll.refresh()
    }
  },
  destroyed () {
    this.BScroll && this.BScroll.destroy()
  },
  components: {
    Loading
  }
}
</script>

<style lang="less">
.top-header {
  position: relative;
  z-index: 40;
}
.song-list {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #222;
  z-index: 199304140958;
  color: #fff;
}
.icon-back {
  font-size: 20px;
  color: #ffcd32;
}
.song-list-title {
  position: absolute;
  left: 10%;
  right: 0;
  width: 80%;
  line-height: 40px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: 400;
}
.bg-image {
  position: relative;
  width: 100%;
  padding-top: 70%;
  background-size: cover;
  z-index: 0;
  &.small {
    padding-top: 0;
    height: 40px;
    z-index: 10;

  }
}
.play-wrapper {
  position: absolute;
  bottom: 20px;
  width: 100%;
  z-index: 20;
  .play {
    width: 135px;
    padding: 7px 0;
    margin: 0 auto;
    text-align: center;
    border: 1px solid #ffcd32;
    color: #ffcd32;
    border-radius: 100px;
    font-size: 0;
    & > i,
    & > span {
      display: inline-block;
      vertical-align: middle;
      font-size: 12px;
    }
    & > i {
      margin-right: 6px;
    }
  }
}
.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(7,17,27,.4);
}
.bg-layer {
  position: relative;
  height: 100%;
  background: #222;
}
.song-list-wrap {
  position: absolute;
  top: 263px;
  bottom: 0;
  width: 100%;
  background: #222;
  .wrapper {
    padding: 20px 30px;
  }
}
.song-item {
  font-size: 14px;
  padding: 15px 0;
  .song-singer {
    padding-bottom: 0;
    padding-top: 4px;
    margin: 0;
    color: hsla(0,0%,100%,.3);
  }
}
</style>
