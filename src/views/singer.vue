<template>
  <div class="singer">
    <div class="listview" ref="listview">
      <ul>
        <li class="singer-item" v-for="singer in hotSingers" :key="singer.id" ref="singerGroup">
          <h2 class="list-group-title">{{ singer.title }}</h2>
          <ul>
            <li class="singer-name-wrapper flex-horizontal flex-vertical-center" v-for="s in singer.singers" :key="'s' + s.id" @click="handleClickSinger(s.id, s.name)">
              <img width="50" height="50" v-lazy="s.picUrl" alt="">
              <span class="name">
                {{ s.name }}
                <span v-if="s.alias && s.alias.length">({{ s.alias[0] }})</span>
              </span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="list-shortcut" @touchstart.stop.prevent="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
        <ul>
          <li :class="{current: currentIndex === index}" :data-index="index" v-for="(item, index) in hotIndexs" :key="item">{{ item }}</li>
        </ul>
      </div>
      <div class="list-fixed" ref="fixed" v-show="y <= 0">
        <div class="fixed-title" >{{ fixedTitle }}</div>
      </div>
    </div>
    <loading v-if="!hotSingers.length"></loading>
    <router-view :key="key"></router-view>
  </div>
</template>
<script>
import { getHotSingers } from '@/api'
import { mapGetters } from 'vuex'
import BScroll from 'better-scroll'
import Loading from '@/components/base/loading.vue'
const pinyin = require('pinyin')
// 锚点高度
const ANCHOR_HEIGHT = window.innerHeight <= 480 ? 18 : 19
export default {
  data () {
    return {
      // 热门歌手
      hotSingers: [],
      // 热门歌手索引
      hotIndexs: [],
      // 存储每个歌手区域所占高度
      listHeights: [],
      // 当前索引
      currentIndex: 0,
      // better-scroll滚动过的值
      y: -1,
      // 当前歌手的标题栏与下一个歌手标题栏的距离
      diff: 0
    }
  },
  activated () {
    if (this.scroll) {
      this.scroll.refresh()
    }
  },
  created () {
    console.log('歌手页获取数据啦')
    // 存储手指信息的对象
    this.touch = {}
    getHotSingers(100).then(response => {
      if (response.code === 200) {
        let list = response.artists
        let topTenSingers = []
        list.every((ele, index) => {
          topTenSingers.push(ele)
          return index < 9
        })
        // 最热门的前十歌手数据 begin
        let topSingerAry = [{title: '热门', singers: []}]
        let topSingers = topTenSingers.map(artist => {
          let item = {
            id: artist.id,
            name: artist.name,
            picUrl: artist.picUrl,
            alias: artist.alias
          }
          return item
        })
        topSingerAry[0].singers = topSingers
        // 最热门的前十歌手数据 end

        // 待排序的数据
        let preSorted = list.map(artist => {
          let name = artist.name
          // 字母索引
          let letterIndex = 0
          let firstLetter = name[0]
          // 如果歌名第一个字符是字母，则不用使用pinyin获取首字母
          let letters = firstLetter.match(/^[a-zA-Z]/)
          // 如果是中文，则使用pinyin获取对应的字母
          if (!letters) {
            let py = pinyin(firstLetter, {
              style: pinyin.STYLE_FIRST_LETTER
            })
            letterIndex = py[0][0].toUpperCase()
          } else {
            letterIndex = firstLetter.toUpperCase()
          }
          let item = {
            // 字母索引
            letterIndex,
            id: artist.id,
            name: artist.name,
            picUrl: artist.picUrl,
            alias: artist.alias
          }
          return item
        })
        // 排好序
        preSorted.sort((current, next) => {
          return current.letterIndex.charCodeAt(0) - next.letterIndex.charCodeAt(0)
        })
        // console.log('排序后的preSorted', preSorted)
        let current = preSorted[0]['letterIndex']
        // 保存某个字母列表下的所有歌手
        let singers = []
        // 保存最终的结果集
        let result = []
        for (let index = 0; index < preSorted.length; index++) {
          let element = preSorted[index]
          // 标识是否是最后一个元素
          let isLastElement = index === preSorted.length - 1
          if (element.letterIndex !== current) {
            result.push({
              title: current,
              singers
            })
            current = element.letterIndex
            singers = []
          }
          if (element.letterIndex === current) {
            singers.push(element)
            preSorted.splice(index, 1)
            index = -1
            // 在最后一个元素的时候需要手动将最后一组的数据push到result中
            if (isLastElement) {
              result.push({
                title: current,
                singers
              })
            }
          }
        }
        result.pop()
        let hotSingersData = this.hotSingers = topSingerAry.concat(result)
        this.hotIndexs = hotSingersData.map(elem => {
          return (elem.title.length > 1 ? elem.title[0] : elem.title)
        })
        this.$nextTick(() => {
          // 存储高度
          let groups = this.singerGroup = this.$refs.singerGroup
          let sumHeight = 0
          for (let i = 0; i < groups.length; i++) {
            sumHeight += window.parseFloat(window.getComputedStyle(groups[i]).getPropertyValue('height'))
            this.listHeights.push(sumHeight)
          }
          /* eslint-disable no-new */
          this.scroll = new BScroll(this.$refs.listview, {
            click: true,
            probeType: 3
          })
          this.scroll.on('scroll', pos => {
            this.y = pos.y
          })
        })
      }
    })
  },
  methods: {
    handleClickSinger (singerId, singerName) {
      this.$router.push({path: '/singer/' + singerId, query: {title: singerName}})
    },
    onShortcutTouchStart (e) {
      let anchorIndex = Number(e.target.getAttribute('data-index'))
      let firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    onShortcutTouchMove (e) {
      let firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      // console.log('y2', this.touch.y2, 'y1', this.touch.y1)
      let distance = Math.round((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT)
      let anchorIndex = this.touch.anchorIndex + distance
      // console.log('anchorIndex 02:', anchorIndex)
      this._scrollTo(anchorIndex)
    },
    _scrollTo (index, duration = 100) {
      if (index < 0) {
        index = 0
      } else if (index > this.singerGroup.length - 1) {
        index = this.singerGroup.length - 1
      }
      this.scroll.scrollToElement(this.singerGroup[index], duration)
    }
  },
  computed: {
    // 设置顶部固定标题
    fixedTitle () {
      return this.hotSingers[this.currentIndex] ? this.hotSingers[this.currentIndex].title : ''
    },
    key () {
      return (typeof this.$route.name) !== 'undefined' ? this.$route.name + +new Date() : this.$route + +new Date()
    },
    ...mapGetters(['calcBottom'])
  },
  watch: {
    diff (newVal) {
      console.log('diff:', newVal)
      let fixedTop = (newVal > 0 && newVal < 30) ? newVal - 30 : 0
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
    },
    calcBottom: function (newValue) {
      this.$nextTick(() => {
        console.log('歌手页面刷新better-scroll')
        this.BScroll && this.BScroll.refresh()
      })
    },
    y (newY) {
      if (-newY < this.listHeights[0]) {
        this.currentIndex = 0
        this.diff = this.listHeights[0] + newY
        return
      }
      // 判断scrollY的值存在于哪个歌手列表区间，更换顶部标题栏
      for (let i = 0; i < this.listHeights.length - 1; i++) {
        let height01 = this.listHeights[i]
        let height02 = this.listHeights[i + 1]
        // console.log('height01:', height01, 'height02:' + height02)
        if (-newY >= height01 && -newY < height02) {
          this.currentIndex = i + 1
          this.diff = height02 + newY
        }
      }
    }
  },
  destroyed () {
    console.log('销毁better-scroll了')
    this.scroll && this.scroll.destroy()
  },
  components: {
    Loading
  }
}
</script>

<style lang="less" scoped>
  .singer {
    width: 100%;
    height: 100%;
  }
  .listview {
    position: relative;
    width: 100%;
    height: 100%;
    background: #222;
    overflow: hidden;
  }
  .list-shortcut {
    width: 20px;
    padding: 20px 0;
    position: absolute;
    right: 0;
    top: 50%;
    z-index: 1;
    transform: translateY(-50%);
    border-radius: 10px;
    background-color: rgba(0, 0, 0, .3);
    font-family: Helvetica;
    ul {
      margin-bottom: 0;
    }
    li {
      padding: 2px 3px;
      color: hsla(0,0%,100%,.5);
      font-size: 12px;
      text-align: center;
      &.current {
        color: #ffcd32;
      }
    }
  }
  .singer-name-wrapper {
    padding: 20px 0 0 30px;
    color: hsla(0,0%,100%,.5);
    font-size: 14px;
    img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
    }
    .name {
      margin-left: 20px;
    }
  }
  .singer-item {
    .list-group-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: 12px;
      color: hsla(0,0%,100%,.5);
      background: #333;
      margin: 0;
    }
    .singer-name-wrapper:last-child {
      padding-bottom: 20px;
    }
  }
  .list-fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    .fixed-title {
      height: 30px;
      padding-left: 20px;
      line-height: 30px;
      color: hsla(0, 0%, 100%, 0.5);
      background: #333;
      font-size: 12px;
      transition: all 0.1s;
    }
  }
</style>
