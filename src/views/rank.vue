<template>
  <div class="rank-wrap" ref="rank">
    <div class="rank">
      <div class="office-rank">
        <h2 class="title">官方榜</h2>
        <ul>
          <li class="flex-horizontal-nowrap flex-vertical-center rank-item" v-for="pop in officialToplist" :key="pop.id" @click="handleRank(pop.id, pop.name)">
            <div class="rank-img">
              <img width="100" height="100" v-lazy="pop.coverImgUrl" alt="pop.name">
            </div>
            <div class="rank-songs-wrap flex-horizontal ellipsis">
              <div class="rank-songs flex-vertical">
                <p class="ellipsis" v-for="(track, index) in pop.tracks" :key="'track' + index">{{ ++index }} {{ track.first }}</p>
              </div>
            </div>
          </li>
        </ul>
        <loading v-if="!officialToplist.length" text="加载官方榜…"></loading>
      </div>
      <div class="recommend-rank">
        <h2 class="title">推荐榜</h2>
        <ul class="recommend flex-horizontal">
          <li v-for="recommend in recommendToplist" :key="recommend.id" class="recommend-wrapper" @click="handleRank(recommend.id, recommend.name)">
            <div class="recommend-item">
              <img width="100" height="100" v-lazy="recommend.coverImgUrl" alt="recommend.name">
              <p>{{ recommend.name }}</p>
            </div>
          </li>
        </ul>
        <loading v-if="!recommendToplist.length" text="加载推荐榜…"></loading>
      </div>
    </div>
    <router-view :key="key"></router-view>
  </div>
</template>
<script>
import { getRankDetail } from '@/api'
import BScroll from 'better-scroll'
import Loading from '@/components/base/loading.vue'
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      // 官方榜
      officialToplist: [],
      // 推荐榜
      recommendToplist: []
      // 歌手榜
      // singerToplist: {},
      // 主流榜单
      // popToplist: [],
      // 赞赏榜单
      // rewardToplist: {}
    }
  },
  created () {
    console.log('排行榜页获取数据啦')
    getRankDetail().then(response => {
      console.log('response', response)
      if (response.code === 200) {
        let popToplist = response.list
        // this.singerToplist = response.artistToplist
        this.officialToplist = popToplist.filter((list, index) => {
          let toplistType = list.ToplistType
          return toplistType
        })
        this.recommendToplist = popToplist.filter((list, index) => {
          return !list.ToplistType
        })
      }
    })
  },
  activated () {
    if (this.BScroll) {
      this.BScroll.refresh()
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.BScroll = new BScroll(this.$refs.rank, {click: true})
    })
  },
  methods: {
    handleRank (id, title) {
      this.$router.push({path: '/rank/' + id, query: {title: title}})
    }
  },
  computed: {
    key () {
      return (typeof this.$route.name) !== 'undefined' ? this.$route.name + +new Date() : this.$route + +new Date()
    },
    ...mapGetters(['calcBottom'])
  },
  watch: {
    calcBottom: function (newValue) {
      this.$nextTick(() => {
        console.log('刷新排行榜的better-scroll')
        this.BScroll && this.BScroll.refresh()
      })
    }
  },
  components: {
    Loading
  }
}
</script>
<style lang="less" scoped>
  .rank-wrap {
    padding-top: 20px;
  }
  .title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 20px;
    color: #888;
  }
  .rank-img {
    flex: 0 0 100px;
    width: 100px;
    height: 100px;
    img {
      width: 100%;
    }
  }
  .rank-songs {
    overflow: hidden;
    flex: 1;
    p {
      margin-bottom: 0;
      flex: 0 0 auto;
      width: 100%;
    }
  }
  .rank-songs-wrap {
    height: 100%;
    padding: 0 20px;
    background: #333;
    color: hsla(0,0%,100%,.3);
    font-size: 12px;
    flex: 1;
  }
  .rank-item {
    margin: 0 20px;
    padding-top: 20px;
    height: 100px;
    box-sizing: content-box;
    overflow: hidden;
  }
  .rank-wrap {
    height: 100%;
    overflow: hidden;
  }
  .recommend {
    padding-top: 20px;
    margin: 0 20px;
    color: hsla(0, 0%, 100%, 0.3);
    .recommend-wrapper {
      &:nth-child(3n + 1) {
        margin: 0;
      }
      &:nth-child(3n) {
        margin-left: 0
      }
    }
  }
  .recommend-wrapper {
    width: 33.33333333%;
    text-align: center;
    font-size: 14px;
    padding: 0 10px;
  }
  .recommend-item {
    img {
      width: 100%;
      height: 100%;
    }
  }
  .office-rank,
  .recommend-rank {
    position: relative;
    min-height: 80px;
  }
</style>
