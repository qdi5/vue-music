export function extractSongInfo (musicList) {
  let songs = []
  console.log('musicList:', musicList)
  // 提取部分数据，组成新的数组对象
  musicList.forEach((music, index) => {
    let songDetail = music.al
    delete songDetail.pic
    let {
      name,
      picUrl
    } = songDetail
    songs.push({
      songId: music.id,
      name,
      picUrl,
      singer: formatSingers(music.ar)
    })
  })
  return songs
}

function formatSingers (ary) {
  if (ary.length === 1) {
    return ary[0].name
  }
  let names = []
  ary.forEach(item => {
    names.push(item.name)
  })
  return names.join(' ')
}
export { formatSingers }
