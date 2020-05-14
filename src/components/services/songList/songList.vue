<template>
  <songs-list :allData="songList" :songListData="songList.tracks" :coverImgUrl="songList.coverImgUrl" id="id" title="getTitle"></songs-list>
</template>
<script>
import { getSongListDetail } from '@/api/index.js'
import SongsList from '../../comm/songs-list'
export default {
  props: ['id'],
  data () {
    return {
      songList: {
        tracks: []
      }
    }
  },
  created () {
    getSongListDetail(Number(this.id)).then(response => {
      this.songList = Object.freeze(response.playlist)
      console.log('this.songList:', this.songList)
    })
  },
  components: {
    SongsList
  }
}
</script>
