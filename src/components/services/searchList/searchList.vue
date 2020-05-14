<template>
  <songs-list :allData="songList" :songListData="songList.hotSongs" :coverImgUrl="songList.artist.picUrl" id="id"></songs-list>
</template>
<script>
import { getSingerSongs } from '@/api/index.js'
import SongsList from '../../comm/songs-list'
export default {
  props: ['id'],
  data () {
    return {
      songList: {
        hotSongs: [],
        artist: {
          picUrl: ''
        }
      }
    }
  },
  created () {
    getSingerSongs(Number(this.id)).then(response => {
      if (response.code === 200) {
        this.songList = response
      }
    })
  },
  components: {
    SongsList
  }
}
</script>
