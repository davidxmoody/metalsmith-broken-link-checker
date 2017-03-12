const cheerio = require("cheerio")

// TODO consider adding script tags and stylesheet links

module.exports = ({
  html,
  filename,
  options,
}) => {
  const results = []

  const $ = cheerio.load(html)

  let selector
  if (options.checkLinks && options.checkImages) {
    selector = "a, img"
  } else if (options.checkLinks) {
    selector = "a"
  } else if (options.checkImages) {
    selector = "img"
  } else {
    // Check nothing
    return []
  }

  $(selector).each((index, element) => {
    const $link = $(element)

    if ($link.is("a")) {
      const isAnchor = ($link.attr("name") || $link.attr("id")) && ($link.attr("href") == null)

      results.push({
        target: $link.attr("href"),
        type: isAnchor ? "anchor" : "link",
        filename,
        description: `href: "${$link.attr("href")}", text: "${$link.text()}"`,
      })

    } else if ($link.is("img")) {
      results.push({
        target: $link.attr("src"),
        type: "image",
        filename,
        description: `href: "${$link.attr("href")}", text: "${$link.attr("alt")}"`,
      })
    }
  })

  return results
}
