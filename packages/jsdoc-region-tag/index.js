const glob = require('glob')
const { readFileSync } = require('fs')
const { resolve } = require('path')

const SAMPLES_DIRECTORY = process.env.SAMPLES_DIRECTORY || resolve(process.cwd(), './samples')
const REGION_START_REGEX = /\[START\s+([^\]]+)/
const REGION_END_REGEX = /\[END/

const sampleCache = new Map()
exports.loadSampleCache = function () {
  const sampleCandidates = glob.sync(`${SAMPLES_DIRECTORY}/**/*.{js,ts}`, { ignore: ['node_modules'] })
  for (const candidate of sampleCandidates) {
    const content = readFileSync(candidate, 'utf8')
    if (REGION_START_REGEX.test(content)) {
      parseSamples(content)
    }
  }
  return sampleCache
}

function parseSamples (content) {
  let key
  let sample
  let inTag = false
  for (const line of content.split(/\r?\n/)) {
    if (inTag && REGION_END_REGEX.test(line)) {
      sampleCache.set(key, sample)
      inTag = false
    } else if (inTag) {
      sample += `${line}\n`
    } else {
      const match = line.match(REGION_START_REGEX)
      if (match) {
        key = match[1]
        sample = ''
        inTag = true
      }
    }
  }
}

exports.handlers = {
  newDoclet: e => {
    if (sampleCache.size === 0) {
      exports.loadSampleCache()
    }

    const examples = e.doclet.examples

    if (!examples) {
      return
    }

    for (const [i, example] of examples.entries()) {
      if (example.includes('region_tag')) {
        const [, tag, intro] = example.split(/\r?\n/)
        const key = tag.replace('region_tag:', '').trim()
        const sample = sampleCache.get(key)
        if (!sample) {
          console.warn(`could not find sample ${key}`)
        } else {
          examples[i] = intro ? `<caption>${intro}</caption>\n${sample}` : sample
        }
      }
    }
  }
}
