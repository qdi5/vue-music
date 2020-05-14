
export default class Song {
  constructor({id, mid, singer, name, album, duration, image, url}) {

  }
}

export function createSong(musicData) {
  return new Song()
}

function filterSinger(singer) {
  let ret = []
  if (!singer) {

  }
  singer.forEach(s => {
    ret.push(s.name)
  })
  return ret.join('/')
}