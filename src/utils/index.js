export function addZero (num) {
  let result = 0
  if (typeof num === 'number' && !isNaN(num)) {
    if (num < 10 || Number(num) === 0) {
      result = '0' + num
    }
  }
  return result || num
}

// 计算出歌曲的毫秒数
/**
 *
 * @param {时间字符串，可能有毫秒也可能没有毫秒} time
 */
function calcMs (time) {
  // 存储分秒
  let fm = []
  let temp = null
  // 歌曲的总毫秒数
  let ms = 0
  // 时间可能没有毫秒的情况
  if (time.indexOf('.') !== -1) {
    // 有毫秒的情况
    let splitTime = time.split('.')
    // 存储分秒
    temp = splitTime[0]
    ms = Number(splitTime[1])
  }
  fm = (temp || time).split(':')
  // 将歌曲时间转换为毫秒数
  ms += fm[0] * 1000 * 60 + fm[1] * 1000
  return ms
}

/*
歌词解析思路：
 一、每一个时间(转换为毫秒)对应一句歌词，用一个对象存起来
 1、以换行符分割歌词，得到带有时间字的每句歌词
 2、直接使用lyric.substr(lyric.lastIndexOf(']') + 1) 得到歌词
 3、使用正则提取时间
 /\[(\d{2}:\d{2}(.\d+)?)\]/g (提取形如[03:22.000]之类的字符串。可能没有毫秒，所以正则里面有个?)
 4、每句歌词和对应的时间（毫秒）分别放入两个数组中（方便做歌词同步）
 二、当一句歌词对应多个时间段时
 1、找到多个时间段，分别用多个key(时间毫秒数作为key值)存起来，value都一样
 2、根据key顺序排序
*/
export function parseLyric (lyric) {
  // 以换行符分割
  let lyricAry = lyric.split(/\n/)
  // 删除最后一句空白歌词
  if (!String(lyricAry[lyricAry.length - 1]).trim()) {
    lyricAry.pop()
  }
  // 存储带有时间的歌词对象
  let lyricWithTime = []
  // 存储所有歌词的时间
  let tm = []
  // 存储每一句歌词
  let lc = []
  // 歌词是否需要重新排序
  let isNeedOrder = false
  // 正则匹配时间段（可能有毫秒）
  let reg = /\[(\d{2}:\d{2}(.\d+)?)\]/g
  lyricAry.forEach(ly => {
    // 存储每句歌词的对象
    let singleLyric = ly.substr(ly.lastIndexOf(']') + 1)
    var result
    // 存储多个时间段的数组
    var timeAry = []
    while ((result = reg.exec(ly)) !== null) {
      // 获取匹配字符串的组，也就是最终的时间字符串
      let time = result[1]
      // 匹配到的索引位置
      timeAry.push(time)
    }
    // 时间段出现的次数，如果大于一，说明多个时间段对应一句歌词
    var displayTimes = timeAry.length
    // 如果是一句歌词对应一个时间
    if (displayTimes === 1) {
      // 使用老逻辑
      let time = timeAry[0]
      let ms = calcMs(time)
      if (typeof ms === 'number' && !isNaN(ms)) {
        tm.push(ms)
        lc.push(singleLyric)
        lyricWithTime.push({
          time: ms,
          lyric: singleLyric
        })
      }
    } else {
      // 如果一句歌词对应多个时间
      if (!isNeedOrder) {
        isNeedOrder = true
      }
      // 使用新逻辑
      timeAry.forEach(t => {
        let ms = calcMs(t)
        if (typeof ms === 'number' && !isNaN(ms)) {
          lyricWithTime.push({
            time: ms,
            lyric: singleLyric
          })
        }
      })
    }
  })
  if (isNeedOrder) {
    lyricWithTime.sort((a, b) => {
      return a.time - b.time
    })
    // 数组顺序打乱之后，需要重新设置tm和lc的值。
    tm = []
    lc = []
    lyricWithTime.forEach(lyricObj => {
      tm.push(lyricObj.time)
      lc.push(lyricObj.lyric)
    })
  }
  return {
    tm: tm,
    lc: lc
  }
}

let getNow = function () {
  return Date.now || new Date().getTime()
}

export { getNow }

// 节流 (//创建并返回一个像节流阀一样的函数，当重复调用函数的时候，最多每隔 wait毫秒调用一次该函数。)
export function throttle (func, wait, options) {
  var context, args, result
  var timeout = null
  var previous = 0
  if (!options) options = {}
  var later = function () {
    previous = options.leading === false ? 0 : getNow()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }
  return function () {
    var now = getNow()
    if (!previous && options.leading === false) previous = now
    var remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}

// 防抖 (//返回 function 函数的防反跳版本, 将延迟函数的执行(真正的执行)在函数最后一次调用时刻的 wait 毫秒之后)
export function debounce (func, wait, immediate) {
  var timeout, args, context, timestamp, result
  var later = function () {
    var last = getNow() - timestamp
    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }
  return function () {
    context = this
    args = arguments
    timestamp = getNow()
    var callNow = immediate && !timeout
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }
    return result
  }
}

// 产生min到max之间的随机数(包含min，不包含max)
export function randomNum (min, max) {
  if (max < min) return
  return Math.floor(Math.random() * (max - min) + min)
}

// 去掉首尾空格
export function trim (str) {
  if (typeof str !== 'string') {
    return
  }
  return str.replace(/^\s*/, '').replace(/\s*$/, '')
}
