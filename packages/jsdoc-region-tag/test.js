/* global describe, it */

process.env.SAMPLES_DIRECTORY = './fixtures'

const { loadSampleCache } = require('./')
const { expect } = require('chai')

describe('jsdoc-region-tag', () => {
  describe('loadSampleCache', () => {
    it('populates a cache with samples found between region tags', () => {
      const cache = loadSampleCache()
      const sample = cache.get('bigquery_quickstart')
      expect(sample).to.include('async function createDataset () {')
    })
  })
})
