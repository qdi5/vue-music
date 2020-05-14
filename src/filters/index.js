export function formatArtists (val) {
  let result = []
  if (val.length > 1) {
    val.forEach(item => {
      result.push(item.name)
    })
    result = result.join(' ')
  } else {
    result = val[0].name
  }
  return result
}
