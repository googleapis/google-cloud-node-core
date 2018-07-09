/**
 * Copyright 2013 Google Inc. All Rights Reserved.
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

import assert from 'assert';
import {AxiosRequestConfig} from 'axios';
import nock from 'nock';

import {DefaultTransporter, RequestError} from '../src/transporters';
assert.rejects = require('assert-rejects');

const savedEnv = process.env;
afterEach(() => {
  process.env = savedEnv;
});

nock.disableNetConnect();

const defaultUserAgentRE = 'google-api-nodejs-client/\\d+.\\d+.\\d+';
const transporter = new DefaultTransporter();

it('should set default client user agent if none is set', async () => {
  const url = 'http://example.com';
  const scope = nock(url).get('/').reply(200, {});
  const res = await transporter.request({url});
  assert.strictEqual(typeof res.config.adapter, 'function');
  assert.deepStrictEqual(
      res.config.adapter, require('axios/lib/adapters/http'));
  scope.done();
});

it('should set default adapter to node.js', () => {
  const opts = transporter.configure();
  const re = new RegExp(defaultUserAgentRE);
  assert(re.test(opts.headers!['User-Agent']));
});

it('should append default client user agent to the existing user agent', () => {
  const applicationName = 'MyTestApplication-1.0';
  const opts = transporter.configure(
      {headers: {'User-Agent': applicationName}, url: ''});
  const re = new RegExp(applicationName + ' ' + defaultUserAgentRE);
  assert(re.test(opts.headers!['User-Agent']));
});

it('should not append default client user agent to the existing user agent more than once',
   () => {
     const appName = 'MyTestApplication-1.0 google-api-nodejs-client/foobear';
     const opts =
         transporter.configure({headers: {'User-Agent': appName}, url: ''});
     assert.equal(opts.headers!['User-Agent'], appName);
   });

it('should create a single error from multiple response errors', done => {
  const firstError = {message: 'Error 1'};
  const secondError = {message: 'Error 2'};
  const url = 'http://example.com';
  const scope = nock(url).get('/').reply(
      400, {error: {code: 500, errors: [firstError, secondError]}});
  transporter.request({url}, (error) => {
    scope.done();
    assert.strictEqual(error!.message, 'Error 1\nError 2');
    assert.equal((error as RequestError).code, 500);
    assert.equal((error as RequestError).errors.length, 2);
    done();
  });
});

it('should return an error for a 404 response', done => {
  const url = 'http://example.com';
  const scope = nock(url).get('/').reply(404, 'Not found');
  transporter.request({url}, error => {
    scope.done();
    assert.strictEqual(error!.message, 'Not found');
    assert.equal((error as RequestError).code, 404);
    done();
  });
});

it('should return an error if you try to use request config options', done => {
  const expected =
      '\'uri\' is not a valid configuration option. Please use \'url\' instead. This library is using Axios for requests. Please see https://github.com/axios/axios to learn more about the valid request options.';
  transporter.request(
      {
        uri: 'http://example.com/api',
      } as AxiosRequestConfig,
      (error) => {
        assert.equal(error!.message, expected);
        done();
      });
});

it('should return an error if you try to use request config options with a promise',
   async () => {
     const expected = new RegExp(
         `'uri' is not a valid configuration option. Please use 'url' instead. This ` +
         `library is using Axios for requests. Please see https://github.com/axios/axios ` +
         `to learn more about the valid request options.`);
     const uri = 'http://example.com/api';
     assert.throws(
         () => transporter.request({uri} as AxiosRequestConfig), expected);
   });

it('should support invocation with async/await', async () => {
  const url = 'http://example.com';
  const scope = nock(url).get('/').reply(200);
  const res = await transporter.request({url});
  scope.done();
  assert.equal(res.status, 200);
});

it('should throw if using async/await', async () => {
  const url = 'http://example.com';
  const scope = nock(url).get('/').reply(500, '🦃');
  await assert.rejects(transporter.request({url}), /🦃/);
  scope.done();
});

it('should work with a callback', done => {
  const url = 'http://example.com';
  const scope = nock(url).get('/').reply(200);
  transporter.request({url}, (err, res) => {
    scope.done();
    assert.equal(err, null);
    assert.equal(res!.status, 200);
    done();
  });
});

it('should use the http proxy if one is configured', async () => {
  process.env['http_proxy'] = 'http://han:solo@proxy-server:1234';
  const transporter = new DefaultTransporter();
  const scope = nock('http://proxy-server:1234')
                    .get('http://example.com/fake', undefined, {
                      reqheaders: {
                        'host': 'example.com',
                        'accept': /.*/g,
                        'user-agent': /google-api-nodejs-client\/.*/g,
                        'proxy-authorization': /.*/g
                      }
                    })
                    .reply(200);
  const url = 'http://example.com/fake';
  const result = await transporter.request({url});
  scope.done();
  assert.equal(result.status, 200);
});

it('should use the https proxy if one is configured', async () => {
  process.env['https_proxy'] = 'https://han:solo@proxy-server:1234';
  const transporter = new DefaultTransporter();
  const scope = nock('https://proxy-server:1234')
                    .get('https://example.com/fake', undefined, {
                      reqheaders: {
                        'host': 'example.com',
                        'accept': /.*/g,
                        'user-agent': /google-api-nodejs-client\/.*/g,
                        'proxy-authorization': /.*/g
                      }
                    })
                    .reply(200);
  const url = 'https://example.com/fake';
  const result = await transporter.request({url});
  scope.done();
  assert.equal(result.status, 200);
});
