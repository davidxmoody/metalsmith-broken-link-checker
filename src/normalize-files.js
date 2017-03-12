function isHtml(filename) {
  return /\.html$/.test(filename)
}

module.exports = (files) => {
  return Object.keys(files).reduce((acc, filename) => {
    if (!isHtml(filename)) return acc

    const file = files[filename] || {}
    const contents = file.contents || ""
    acc[filename] = contents.toString()

    return acc
  }, {})
}
