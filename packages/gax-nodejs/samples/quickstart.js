/*
 * Copyright 2019, Google LLC
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

// [START gax_quickstart]
async function main() {
  // Wraps a function to retry it several times.

  const gax = require('google-gax');

  // Let's say we have an API call. It only supports callbacks,
  // accepts 4 parameters (just like gRPC stub calls do),
  // and can fail sometimes...
  let callCounter = 0;
  function doStuff(request, options, metadata, callback) {
    ++callCounter;
    if (callCounter % 2 === 1) {
      // ...like, every second call.
      console.log('This call failed');
      const error = new Error('It failed!');
      error.code = 42;
      callback(error);
      return;
    }

    console.log('This call succeeded');
    callback(null, {response: 'ok'});
  }

  // We define call settings object:
  const settings = new gax.CallSettings();
  settings.retry = gax.createRetryOptions(
    /* retryCodes: */ [42],
    /* backoffSettings: */ gax.createDefaultBackoffSettings()
  );

  // and use createApiCall to get a promisifed function that handles retries!
  const wrappedFunction = gax.createApiCall(doStuff, settings);

  // Try it!
  const [result] = await wrappedFunction({request: 'empty'});
  console.log(result);
}

main().catch(console.error);
// [END gax_quickstart]
