<template>
  <div class="recommend" ref="recommend">
    <div class="wrapper">
      <div class="slide-wrapper">
        <div class="carousel-wrap" ref="slide">
            <div class="carousel-content flex-horizontal-nowrap" ref="slideContent">
              <template v-if="banners && banners.length">
                <a href="#" v-for="(banner, index) in banners" :key="index"><img @load="handleImgLoad" :src="banner.imageUrl" alt=""></a>
              </template>
            </div>
            <div class="dots" v-if="isFirstImgLoaded">
              <span :class="{active: currentPageIndex === index}" v-for="(dot, index) in dots" :key="index" ></span>
            </div>
            <loading v-if="!banners" text="加载图片…"></loading>
          </div>
      </div>
       
      <p class="rm-title">热门歌单推荐</p>
      <div class="hot-song-list" v-if="songList && songList.length">
        <div class="hot-song-item flex-horizontal-nowrap flex-vertical-center" v-for="songItem in songList" :key="songItem.id" @click="$router.push({path: '/recommend/' + songItem.id, query: {title: songItem.name}})">
          <div class="song-img">
            <img width="60" height="60" v-lazy="songItem.picUrl" alt="songItem.name">
          </div>
          <div class="song-info">
            <div class="song-name">{{ songItem.name }}</div>
            <div class="song-list-summary">{{ songItem.copywriter }}</div>
          </div>
        </div>
      </div>
    </div>
    <loading v-if="!songList"></loading>
    <transition enter-active-class="animated fadeInRight faster" leave-active-class="animated fadeOutRight faster">
      <router-view :key="key"></router-view>
    </transition>
  </div>
</template>
<script>
import {getRecommendSongList, getBanner} from '../api/index.js'
import Loading from '@/components/base/loading.vue'
import BScroll from 'better-scroll'
export default {
  data () {
    return {
      songList: null,
      banners: null,
      // 轮播图的参数
      autoPlay: true,
      loop: true,
      interval: 3000,
      // 轮播指示器小圆点
      dots: [],
      // 当前轮播的索引
      currentPageIndex: 0,
      // 滚动距离超过宽度/高度的 30% 时切换图片
      threshold: 0.3,
      // 是否显示指示器
      showDot: true,
      // 第一张图是否加载完毕
      isFirstImgLoaded: false
    }
  },
  created () {
    // console.log('recommend获取数据啦')
    getRecommendSongList().then(response => {
      if (response.code === 200) {
        this.songList = response.result
      }
    })

    getBanner().then(result => {
      console.log('获取banner:', result)
      if (result.code === 200) {
        this.banners = result.banners
      }
    })
  },
  activated () {
    // 防止轮播图出现bug，不滚动的问题
    if (this.slide) {
      this.slide.enable()
      let pageIndex = this.slide.getCurrentPage().pageX
      this.slide.goToPage(pageIndex, 0, 0)
      this.currentPageIndex = pageIndex
      if (this.autoPlay) {
        this.play()
      }
    }
    if (this.recommendSlide) {
      this.recommendSlide.refresh()
    }
    
  },
  deactivated() {
     this.slide.disable()
     clearTimeout(this.timer)
  },
  mounted () {
    this.$nextTick().then(() => {
      this.recommendSlide = new BScroll(this.$refs.recommend, {click: true})
    })
    // 监听页面窗口变化事件
    window.addEventListener('resize', () => {
      if (!this.slide || !this.slide.enable) {
        return
      }
      clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(() => {
        // isInTransition: 判断当前scroll是否处于滚动动画过程中
        // 当开启CSS3 Transition动画时判断该值
        // console.log('this.slide.isInTransition:', this.slide.isInTransition)
        if (this.slide.isInTransition) {
          this.onScrollEnd()
        } else {
          if (this.autoPlay) {
            this.play()
          }
        }
        this.refresh()
      }, 60)
    })
  },
  methods: {
    // 设置slide容器的宽度
    setSliderWidth (isResize) {
      let slide = this.$refs.slide
      let slideContent = this.$refs.slideContent
      // 获取slider里的所有子元素也就是所有图片
      this.children = slideContent.children
      // console.log('this.children:', this.children)
      // 计算容器宽度
      let slideWidth = slide.clientWidth
      // 所有图片宽度累加后的宽度
      let totalWidth = 0
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        child.style.width = slideWidth + 'px'
        totalWidth += slideWidth
      }
      // 如果是无缝滚动，需要增加2个图片的宽度
      // 如果是窗口变化的情况下，则不增加宽度
      if (this.loop && !isResize) {
        totalWidth += 2 * slideWidth
      }
      this.$refs.slideContent.style.width = totalWidth + 'px'
    },
    // 初始化轮播指示器
    initDots () {
      this.dots = new Array(this.children.length)
    },
    // 初始化轮播
    initSlide () {
      let options = {
        scrollX: true,
        scrollY: false,
        click: true,
        momentum: false,
        bounce: false,
        stopPropagation: true,
        snap: {
          loop: this.loop, // 开启循环播放
          threshold: this.threshold, // 滚动距离超过宽度/高度的 30% 时切换图片
          speed: 400 // 切换动画时长 400ms
        }
      }
      this.slide = new BScroll(this.$refs.slide, options)
      this.slide.on('scrollEnd', this.onScrollEnd)
      this.slide.on('touchEnd', () => {
        // console.log('触发touchEnd')
        if (this.autoPlay) {
          this.play()
        }
      })
      // 为了避免手指拖动与自动轮播同时执行，导致一次滑动两个图片，需要先清除自动轮播的定时器
      this.slide.on('beforeScrollStart', () => {
        // console.log('触发beforeScrollStart')
        if (this.autoPlay) {
          clearTimeout(this.timer)
        }
      })
    },
    // better-scroll滚动结束事件处理函数
    onScrollEnd () {
      // console.log('触发scrollEnd')
      let pageIndex = this.slide.getCurrentPage().pageX // 横轴方向的页面数(相当于当前的轮播索引值)
      this.currentPageIndex = pageIndex
      if (this.autoPlay) {
        this.play()
      }
    },
    // 自动轮播方法
    play () {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.slide.next()
      }, this.interval)
    },
    // 初使化方法
    init () {
      clearTimeout(this.timer)
      this.currentPageIndex = 0
      this.setSliderWidth()
      if (this.showDot) {
        this.initDots()
      }
      this.initSlide()
      if (this.autoPlay) {
        this.play()
      }
    },
    // 重新设置轮播容器宽度，同时刷新better-scroll
    refresh () {
      this.setSliderWidth(true)
      this.slide.refresh()
    },
    handleImgLoad () {
      console.log('图片加载成功咯……')
      if (!this.isFirstImgLoaded) {
        this.isFirstImgLoaded = true
      }
    }
  },
  computed: {
    key () {
      return (typeof this.$route.name) !== 'undefined' ? this.$route.name + +new Date() : this.$route + +new Date()
    }
  },
  watch: {
    banners (newVal) {
      this.$nextTick().then(() => {
        this.init()
      })
    }
  },
  beforeDestory () {
    this.slide && this.slide.destory()
  },
  components: {
    Loading
  }
}
</script>
<style lang="less" scoped>
.recommend {
  height: 100%;
  overflow: hidden;
}
.slide-wrapper {
  width: 100%;
  position: relative;
  padding-top: (139 / 375) * 100%;
  background: transparent;
  .carousel-wrap {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    overflow: hidden;
    
  }
}
.carousel-wrap {
  width: 100%;
  position: relative;
  overflow: hidden;
}
.carousel-content {
  position: relative;
  left: 0;
  animation: mov 10s linear infinite;
  width: 900%;
  a {
    display: block;
    width: 100%;
  }
  img {
    width: 100%;
    height: auto;
  }
}
.dots {
  position: absolute;
  right: 0;
  left: 0;
  bottom: 12px;
  width: 100%;
  transform: translateZ(1px);
  text-align: center;
  font-size: 0;
  span {
    display: inline-block;
    margin: 0 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: hsla(0,0%,100%,.8);
    transition: all 0.3s;
    &.active {
      width: 20px;
      border-radius: 10px;
    }
  }
}
.rm-title {
  height: 65px;
  line-height: 65px;
  text-align: center;
  font-size: 14px;
  color: #ffcd32
}
.hot-song-item {
  padding: 0 20px 20px;
  color: #fff;
  font-size: 14px;
}
.song-img {
  flex: 0 0 60px;
  padding-right: 20px;
}
.song-info {
  .song-name {
    margin-bottom: 10px;
  }
  .song-list-summary {
    color: hsla(0,0%,100%,.3);
  }
}

</style>
