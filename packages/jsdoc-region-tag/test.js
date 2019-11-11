/* global describe, it */

/*!
 * Copyright 2019 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
