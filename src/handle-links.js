 var fs = require('fs');

function maybeLog(log, links) {
  links.forEach((link) => {
    if (link.broken) {
      log(`${link.filename} >>> ${link.description}`)
    }
  })
}

function maybeWriteToFile(links) {
  const brokenLinks = links.filter(({broken}) => !!broken)
  const fileName = "broken_links.txt"
  if (brokenLinks.length) {
    const content = brokenLinks.map(link => `${link.filename} >>> ${link.description}`).join('\n')
    fs.writeFile(fileName, content, (err) => { if(err) throw err } )
  } else {
    fs.existsSync(fileName) && fs.unlink(fileName, (err) => { if(err) throw err })
  }
}

function maybeThrow(links) {
  const brokenLinks = links.filter(({broken}) => !!broken)

  if (brokenLinks.length) {
    let message = `You have ${brokenLinks.length} broken links:\n`
    brokenLinks.forEach(({filename, description}) => {
      message += `\n${filename} >>> ${description}`
    })
    throw new Error(message)
  }
}

module.exports = (options, log = console.log) => {
  return (links) => {
    if (options.write_to_file) maybeWriteToFile(links)

    if (options.warn) {
      maybeLog(log, links)
    } else {
      maybeThrow(links)
    }
  }
}
