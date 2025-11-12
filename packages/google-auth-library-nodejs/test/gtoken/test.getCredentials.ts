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
import {describe, it, afterEach} from 'mocha';
import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import {getCredentials} from '../../src/gtoken/getCredentials';

describe('getCredentials', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should return correct credentials for .json extension', async () => {
    const creds = {private_key: 'private-key', client_email: 'client-email'};
    sandbox.stub(fs.promises, 'readFile').resolves(JSON.stringify(creds));
    const credentials = await getCredentials('key.json');
    assert.deepStrictEqual(credentials, {
      privateKey: creds.private_key,
      clientEmail: creds.client_email,
    });
  });

  it('should throw if private_key is missing from JSON', async () => {
    const creds = {client_email: 'client-email'};
    sandbox.stub(fs.promises, 'readFile').resolves(JSON.stringify(creds));
    await assert.rejects(getCredentials('key.json'), /MISSING_CREDENTIALS/);
  });

  it('should throw if client_email is missing from JSON', async () => {
    const creds = {private_key: 'private-key'};
    sandbox.stub(fs.promises, 'readFile').resolves(JSON.stringify(creds));
    await assert.rejects(getCredentials('key.json'), /MISSING_CREDENTIALS/);
  });

  it('should return correct credentials for .pem extension', async () => {
    const privateKey = '-----BEGIN PRIVATE KEY-----...';
    sandbox.stub(fs.promises, 'readFile').resolves(privateKey);
    const credentials = await getCredentials('key.pem');
    assert.deepStrictEqual(credentials, {privateKey});
  });

  it('should return correct credentials for .crt extension', async () => {
    const privateKey = '-----BEGIN CERTIFICATE-----...';
    sandbox.stub(fs.promises, 'readFile').resolves(privateKey);
    const credentials = await getCredentials('key.crt');
    assert.deepStrictEqual(credentials, {privateKey});
  });

  it('should return correct credentials for .der extension', async () => {
    const privateKey = '-----BEGIN CERTIFICATE-----...';
    sandbox.stub(fs.promises, 'readFile').resolves(privateKey);
    const credentials = await getCredentials('key.der');
    assert.deepStrictEqual(credentials, {privateKey});
  });

  it('should throw for .p12 extension', async () => {
    await assert.rejects(getCredentials('key.p12'), /UNKNOWN_CERTIFICATE_TYPE/);
  });

  it('should throw for .pfx extension', async () => {
    await assert.rejects(getCredentials('key.pfx'), /UNKNOWN_CERTIFICATE_TYPE/);
  });

  it('should throw for unknown extension', async () => {
    await assert.rejects(
      getCredentials('key.txt'),
      /Unknown certificate type/
    );
  });
});
