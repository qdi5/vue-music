import { request } from '../utils/request'

// banner
export function getBanner () {
  return request.get('/banner')
}

// 获取推荐歌单
export function getRecommendSongList () {
  return request.get('/personalized')
}

// 获取歌单详情
/**
 *
 * @param {歌单id} songListId
 */
export function getSongListDetail (songListId) {
  if (typeof songListId !== 'number') {
    return Promise.resolve(false)
  }
  return request.get('/playlist/detail?id=' + songListId)
}

// 获取歌曲详情
export function getSongDetail (songId) {
  if (typeof songId !== 'number') {
    return Promise.resolve(false)
  }
  return request.get('/song/detail?ids=' + songId)
}

// 获取音乐url
export function getSongUrl (songId) {
  if (typeof songId !== 'number') {
    return Promise.resolve(false)
  }
  return request.get('/song/url?id=' + songId)
}

// 获取歌词
export function getLyric (songId) {
  if (typeof songId !== 'number') {
    return Promise.resolve(false)
  }
  return request.get('/lyric?id=' + songId)
}

// 搜索
export function search (keywords, type) {
  if (!keywords || !keywords.trim()) {
    return Promise.resolve(false)
  }
  let arg = keywords
  if (type) {
    arg += '&type=' + type
  }
  return request.get('/search?keywords=' + arg)
}

// 搜索建议
export function getSearchSuggest (keywords) {
  if (!keywords || !keywords.trim()) {
    return Promise.resolve(false)
  }
  return request.get('/search/suggest?keywords=' + keywords)
}

// 获取歌手单曲
/**
 *
 * @param {歌手id} singerId
 */
export function getSingerSongs (singerId) {
  if (typeof singerId !== 'number') {
    return Promise.resolve(false)
  }
  return request.get('/artists?id=' + singerId)
}

// 热搜
export function getHotSearch () {
  return request.get('/search/hot')
}

// 排行榜内容摘要
export function getRankDetail () {
  return request.get('/toplist/detail')
}

// 获取指定排行榜的歌单
/**
 *
 * @param {
 '0': 云音乐新歌榜,
 '1': 云音乐热歌榜,
 '2': 网易原创歌曲榜,
 '3': 云音乐飙升榜,
 '4': 云音乐电音榜,
 '5': UK排行榜周榜,
 '6': 美国Billboard周榜
 '7': KTV嗨榜,
 '8': iTunes榜,
 '9': Hit FM Top榜,
 '10': 日本Oricon周榜
 '11': 韩国Melon排行榜周榜,
 '12': 韩国Mnet排行榜周榜,
 '13': 韩国Melon原声周榜,
 '14': 中国TOP排行榜(港台榜),
 '15': 中国TOP排行榜(内地榜)
 '16': 香港电台中文歌曲龙虎榜,
 '17': 华语金曲榜,
 '18': 中国嘻哈榜,
 '19': 法国 NRJ EuroHot 30周榜,
 '20': 台湾Hito排行榜,
 '21': Beatport全球电子舞曲榜,
 '22': 云音乐ACG音乐榜,
 '23': 云音乐嘻哈榜
} idx
 */
export function getRankSongList (idx) {
  return request.get('/top/list?idx=' + idx)
}

// 热门歌手
export function getHotSingers (limit) {
  let query = ''
  if (typeof limit !== 'undefined' && !isNaN(Number(limit))) {
    query = '?limit=' + limit
  }
  return request.get('/top/artists' + query)
}
