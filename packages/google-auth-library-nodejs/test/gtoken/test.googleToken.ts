// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as assert from 'assert';
import {describe, it} from 'mocha';
import {GoogleToken, TokenOptions, Transporter} from '../../src/gtoken/googleToken';
import {GaxiosOptions, GaxiosResponse, request} from 'gaxios';

describe('GoogleToken', () => {
  it('should initialize with default options if none are provided', () => {
    const token: GoogleToken = new GoogleToken();
    const options: TokenOptions = token.getTokenOptions;
    assert.ok(options.transporter);
    assert.ok(typeof options.transporter.request === 'function');
  });

  it('should initialize with provided options', () => {
    const providedOptions: TokenOptions = {
      keyFile: '/path/to/key.json',
      key: 'fake-key',
      email: 'test@example.com',
      iss: 'test-issuer@example.com',
      sub: 'test-subject@example.com',
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      additionalClaims: {aud: 'https://example.com/audience'},
      eagerRefreshThresholdMillis: 5000,
    };
    const token: GoogleToken = new GoogleToken(providedOptions);
    const options: TokenOptions = token.getTokenOptions;
    assert.strictEqual(options.keyFile, providedOptions.keyFile);
    assert.strictEqual(options.key, providedOptions.key);
    assert.strictEqual(options.email, providedOptions.email);
    assert.strictEqual(options.iss, providedOptions.iss);
    assert.strictEqual(options.sub, providedOptions.sub);
    assert.strictEqual(options.scope, providedOptions.scope);
    assert.deepStrictEqual(
      options.additionalClaims,
      providedOptions.additionalClaims
    );
    assert.strictEqual(
      options.eagerRefreshThresholdMillis,
      providedOptions.eagerRefreshThresholdMillis
    );
    assert.ok(options.transporter);
    assert.ok(typeof options.transporter.request === 'function');
  });

  it('should use a custom transporter if provided in options', () => {
    const customTransporter: Transporter = {
      request: async <T>(opts: GaxiosOptions) => {
        const data = 'custom response' as T;
        const res = new Response(JSON.stringify(data));
        return Object.assign(res, {
          data,
          config: opts,
        }) as GaxiosResponse<T>;
      },
    };
    const providedOptions: TokenOptions = {
      email: 'test@example.com',
      transporter: customTransporter,
    };
    const token: GoogleToken = new GoogleToken(providedOptions);
    const options: TokenOptions = token.getTokenOptions;
    assert.deepStrictEqual(options.email, providedOptions.email);
    assert.strictEqual(options.transporter, customTransporter);
  });

  it('getTokenOptions should return the internal tokenOptions object', () => {
    const providedOptions: TokenOptions = {email: 'getter@example.com'};
    const token: GoogleToken = new GoogleToken(providedOptions);
    assert.deepStrictEqual(token.getTokenOptions.email, providedOptions.email);
  });
});
