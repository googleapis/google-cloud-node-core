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

'use strict';

var assert = require('assert');
var googleAuth = require('../lib/auth/googleauth.js');
var nock = require('nock');
var fs = require('fs');
var LoginTicket = require('../lib/auth/loginticket.js');

nock.disableNetConnect();

// Creates a standard JSON credentials object for testing.
function createJSON() {
  return {
    'private_key_id': 'key123',
    'private_key': 'privatekey',
    'client_email': 'hello@youarecool.com',
    'client_id': 'client123',
    'type': 'service_account'
  };
}

describe('Initial credentials', function() {

  it('should create a dummy refresh token string', function () {
    // It is important that the compute client is created with a refresh token value filled
    // in, or else the rest of the logic will not work.
    var auth = new googleAuth();
    var jwt = new auth.JWT();
    assert.equal('jwt-placeholder', jwt.credentials.refresh_token);
  });
});

describe('JWT auth client', function() {

  it('should return null userId even if no payload', function() {
    var ticket = new LoginTicket(null, null);
    assert.equal(ticket.getUserId(), null);
  });

  it('should return envelope', function() {
    var ticket = new LoginTicket('myenvelope');
    assert.equal(ticket.getEnvelope(), 'myenvelope');
  });

  it('should return attributes from getAttributes', function() {
    var ticket = new LoginTicket('myenvelope', 'mypayload');
    assert.deepEqual(ticket.getAttributes(), {
      envelope: 'myenvelope',
      payload: 'mypayload'
    });
  });

  it('should get an initial access token', function(done) {
    var auth = new googleAuth();
    var jwt = new auth.JWT(
        'foo@serviceaccount.com',
        '/path/to/key.pem',
        null,
        ['http://bar', 'http://foo'],
        'bar@subjectaccount.com');
    jwt.gToken = function(opts) {
      assert.equal('foo@serviceaccount.com', opts.iss);
      assert.equal('/path/to/key.pem', opts.keyFile);
      assert.deepEqual(['http://bar', 'http://foo'], opts.scope);
      assert.equal('bar@subjectaccount.com', opts.sub);
      return {
        getToken: function(opt_callback) {
          opt_callback(null, 'initial-access-token');
        }
      };
    };
    jwt.authorize(function() {
      assert.equal('initial-access-token', jwt.credentials.access_token);
      assert.equal('jwt-placeholder', jwt.credentials.refresh_token);
      done();
    });
  });

  it('should accept scope as string', function(done) {
    var auth = new googleAuth();
    var jwt = new auth.JWT(
        'foo@serviceaccount.com',
        '/path/to/key.pem',
        null,
        'http://foo',
        'bar@subjectaccount.com');

    jwt.gToken = function(opts) {
      assert.equal('http://foo', opts.scope);
      done();
      return {
        getToken: function() {}
      };
    };

    jwt.authorize();
  });

  it('should refresh token if missing access token', function(done) {
    var auth = new googleAuth();
    var jwt = new auth.JWT(
        'foo@serviceaccount.com',
        '/path/to/key.pem',
        null,
        ['http://bar', 'http://foo'],
        'bar@subjectaccount.com');

    jwt.credentials = {
      refresh_token: 'jwt-placeholder'
    };

    jwt.gtoken = {
      getToken: function(callback) {
        callback(null, 'abc123');
      }
    };

    jwt.request({}, function() {
      assert.equal('abc123', jwt.credentials.access_token);
      done();
    });
  });

  it('should refresh token if expired', function(done) {
    var auth = new googleAuth();
    var jwt = new auth.JWT(
        'foo@serviceaccount.com',
        '/path/to/key.pem',
        null,
        ['http://bar', 'http://foo'],
        'bar@subjectaccount.com');

    jwt.credentials = {
      access_token: 'woot',
      refresh_token: 'jwt-placeholder',
      expiry_date: (new Date()).getTime() - 1000
    };

    jwt.gtoken = {
      getToken: function(callback) {
        callback(null, 'abc123');
      }
    };

    jwt.request({}, function() {
      assert.equal('abc123', jwt.credentials.access_token);
      done();
    });
  });

  it('should not refresh if not expired', function(done) {
    var scope = nock('https://accounts.google.com')
        .log(console.log)
        .post('/o/oauth2/token', '*')
        .reply(200, { access_token: 'abc123', expires_in: 10000 });

    var auth = new googleAuth();
    var jwt = new auth.JWT(
        'foo@serviceaccount.com',
        '/path/to/key.pem',
        null,
        ['http://bar', 'http://foo'],
        'bar@subjectaccount.com');

    jwt.credentials = {
      access_token: 'initial-access-token',
      refresh_token: 'jwt-placeholder',
      expiry_date: (new Date()).getTime() + 5000
    };

    jwt.request({}, function() {
      assert.equal('initial-access-token', jwt.credentials.access_token);
      assert.equal(false, scope.isDone());
      nock.cleanAll();
      done();
    });
  });

  it('should assume access token is not expired', function(done) {
    var scope = nock('https://accounts.google.com')
        .log(console.log)
        .post('/o/oauth2/token', '*')
        .reply(200, { access_token: 'abc123', expires_in: 10000 });

    var auth = new googleAuth();
    var jwt = new auth.JWT(
        'foo@serviceaccount.com',
        '/path/to/key.pem',
        null,
        ['http://bar', 'http://foo'],
        'bar@subjectaccount.com');

    jwt.credentials = {
      access_token: 'initial-access-token',
      refresh_token: 'jwt-placeholder'
    };

    jwt.request({}, function() {
      assert.equal('initial-access-token', jwt.credentials.access_token);
      assert.equal(false, scope.isDone());
      nock.cleanAll();
      done();
    });
  });

  it('should return expiry_date in milliseconds', function(done) {
    var auth = new googleAuth();
    var jwt = new auth.JWT(
        'foo@serviceaccount.com',
        '/path/to/key.pem',
        null,
        ['http://bar', 'http://foo'],
        'bar@subjectaccount.com');

    jwt.credentials = {
      refresh_token: 'jwt-placeholder'
    };

    var dateInSeconds = (new Date()).getTime() / 1000;

    jwt.gtoken = {
      getToken: function(callback) {
        callback(null, 'token');
      },
      token_expires: dateInSeconds
    };

    jwt.refreshToken_({}, function(err, creds) {
      assert.notEqual(dateInSeconds, creds.expiry_date);
      assert.equal(dateInSeconds * 1000, creds.expiry_date);
      done();
    });
  });
});

describe('.createScoped', function() {
  it('should clone stuff', function() {
    var auth = new googleAuth();
    var jwt = new auth.JWT(
      'foo@serviceaccount.com',
      '/path/to/key.pem',
      null,
      ['http://bar', 'http://foo'],
      'bar@subjectaccount.com');

    var clone = jwt.createScoped('x');

    assert.equal(jwt.email, clone.email);
    assert.equal(jwt.keyFile, clone.keyFile);
    assert.equal(jwt.key, clone.key);
    assert.equal(jwt.subject, clone.subject);
  });

  it('should handle string scope', function() {
    var auth = new googleAuth();
    var jwt = new auth.JWT(
      'foo@serviceaccount.com',
      '/path/to/key.pem',
      null,
      ['http://bar', 'http://foo'],
      'bar@subjectaccount.com');

    var clone = jwt.createScoped('newscope');
    assert.equal('newscope', clone.scopes);
  });

  it('should handle array scope', function() {
    var auth = new googleAuth();
    var jwt = new auth.JWT(
      'foo@serviceaccount.com',
      '/path/to/key.pem',
      null,
      ['http://bar', 'http://foo'],
      'bar@subjectaccount.com');

    var clone = jwt.createScoped(['gorilla', 'chimpanzee', 'orangutan']);
    assert.equal(3, clone.scopes.length);
    assert.equal('gorilla', clone.scopes[0]);
    assert.equal('chimpanzee', clone.scopes[1]);
    assert.equal('orangutan', clone.scopes[2]);
  });

  it('should handle null scope', function() {
    var auth = new googleAuth();
    var jwt = new auth.JWT(
      'foo@serviceaccount.com',
      '/path/to/key.pem',
      null,
      ['http://bar', 'http://foo'],
      'bar@subjectaccount.com');

    var clone = jwt.createScoped();
    assert.equal(null, clone.scopes);
  });

  it('should set scope when scope was null', function() {
    var auth = new googleAuth();
    var jwt = new auth.JWT(
      'foo@serviceaccount.com',
      '/path/to/key.pem',
      null,
      null,
      'bar@subjectaccount.com');

    var clone = jwt.createScoped('hi');
    assert.equal('hi', clone.scopes);
  });

  it('should handle nulls', function() {
    var auth = new googleAuth();
    var jwt = new auth.JWT();

    var clone = jwt.createScoped('hi');
    assert.equal(jwt.email, null);
    assert.equal(jwt.keyFile, null);
    assert.equal(jwt.key, null);
    assert.equal(jwt.subject, null);
    assert.equal('hi', clone.scopes);
  });

  it('should not return the original instance', function() {
    var auth = new googleAuth();
    var jwt = new auth.JWT(
      'foo@serviceaccount.com',
      '/path/to/key.pem',
      null,
      ['http://bar', 'http://foo'],
      'bar@subjectaccount.com');

    var clone = jwt.createScoped('hi');
    assert.notEqual(jwt, clone);
  });
});

describe('.createScopedRequired', function() {
  it('should return true when scopes is null', function () {
    var auth = new googleAuth();
    var jwt = new auth.JWT(
      'foo@serviceaccount.com',
      '/path/to/key.pem',
      null,
      null,
      'bar@subjectaccount.com');

    assert.equal(true, jwt.createScopedRequired());
  });

  it('should return true when scopes is an empty array', function () {
    var auth = new googleAuth();
    var jwt = new auth.JWT(
      'foo@serviceaccount.com',
      '/path/to/key.pem',
      null,
      [],
      'bar@subjectaccount.com');

    assert.equal(true, jwt.createScopedRequired());
  });

  it('should return true when scopes is an empty string', function () {
    var auth = new googleAuth();
    var jwt = new auth.JWT(
      'foo@serviceaccount.com',
      '/path/to/key.pem',
      null,
      '',
      'bar@subjectaccount.com');

    assert.equal(true, jwt.createScopedRequired());
  });

  it('should return false when scopes is a filled-in string', function () {
    var auth = new googleAuth();
    var jwt = new auth.JWT(
      'foo@serviceaccount.com',
      '/path/to/key.pem',
      null,
      'http://foo',
      'bar@subjectaccount.com');

    assert.equal(false, jwt.createScopedRequired());
  });

  it('should return false when scopes is a filled-in array', function () {
    var auth = new googleAuth();
    var jwt = new auth.JWT(
      'foo@serviceaccount.com',
      '/path/to/key.pem',
      null,
      ['http://bar', 'http://foo'],
      'bar@subjectaccount.com');

    assert.equal(false, jwt.createScopedRequired());
  });

  it('should return false when scopes is not an array or a string, but can be used as a string',
    function () {

      var auth = new googleAuth();
      var jwt = new auth.JWT(
        'foo@serviceaccount.com',
        '/path/to/key.pem',
        null,
        2,
        'bar@subjectaccount.com');

      assert.equal(false, jwt.createScopedRequired());
    });
});

describe('.fromJson', function () {

  it('should error on null json', function (done) {
    var auth = new googleAuth();
    var jwt = new auth.JWT();
    jwt.fromJSON(null, function (err) {
      assert.equal(true, err instanceof Error);
      done();
    });
  });

  it('should error on empty json', function (done) {
    var auth = new googleAuth();
    var jwt = new auth.JWT();
    jwt.fromJSON({}, function (err) {
      assert.equal(true, err instanceof Error);
      done();
    });
  });

  it('should error on missing client_email', function (done) {
    var json = createJSON();
    delete json.client_email;

    var auth = new googleAuth();
    var jwt = new auth.JWT();
    jwt.fromJSON(json, function (err) {
      assert.equal(true, err instanceof Error);
      done();
    });
  });

  it('should error on missing private_key', function (done) {
    var json = createJSON();
    delete json.private_key;

    var auth = new googleAuth();
    var jwt = new auth.JWT();
    jwt.fromJSON(json, function (err) {
      assert.equal(true, err instanceof Error);
      done();
    });
  });

  it('should create JWT with client_email', function (done) {
    var json = createJSON();
    var auth = new googleAuth();
    var jwt = new auth.JWT();
    jwt.fromJSON(json, function (err) {
      assert.equal(null, err);
      assert.equal(json.client_email, jwt.email);
      done();
    });
  });

  it('should create JWT with private_key', function (done) {
    var json = createJSON();
    var auth = new googleAuth();
    var jwt = new auth.JWT();
    jwt.fromJSON(json, function (err) {
      assert.equal(null, err);
      assert.equal(json.private_key, jwt.key);
      done();
    });
  });

  it('should create JWT with null scopes', function (done) {
    var json = createJSON();
    var auth = new googleAuth();
    var jwt = new auth.JWT();
    jwt.fromJSON(json, function (err) {
      assert.equal(null, err);
      assert.equal(null, jwt.scopes);
      done();
    });
  });

  it('should create JWT with null subject', function (done) {
    var json = createJSON();
    var auth = new googleAuth();
    var jwt = new auth.JWT();
    jwt.fromJSON(json, function (err) {
      assert.equal(null, err);
      assert.equal(null, jwt.subject);
      done();
    });
  });

  it('should create JWT with null keyFile', function (done) {
    var json = createJSON();
    var auth = new googleAuth();
    var jwt = new auth.JWT();
    jwt.fromJSON(json, function (err) {
      assert.equal(null, err);
      assert.equal(null, jwt.keyFile);
      done();
    });
  });
});

describe('.fromStream', function () {

  it('should error on null stream', function (done) {
    var auth = new googleAuth();
    var jwt = new auth.JWT();
    jwt.fromStream(null, function (err) {
      assert.equal(true, err instanceof Error);
      done();
    });
  });

  it('should read the stream and create a jwt', function (done) {
    // Read the contents of the file into a json object.
    var fileContents = fs.readFileSync('./test/fixtures/private.json', 'utf-8');
    var json = JSON.parse(fileContents);

    // Now open a stream on the same file.
    var stream = fs.createReadStream('./test/fixtures/private.json');

    // And pass it into the fromStream method.
    var auth = new googleAuth();
    var jwt = new auth.JWT();
    jwt.fromStream(stream, function (err) {
      assert.equal(null, err);

      // Ensure that the correct bits were pulled from the stream.
      assert.equal(json.private_key, jwt.key);
      assert.equal(json.client_email, jwt.email);
      assert.equal(null, jwt.keyFile);
      assert.equal(null, jwt.subject);
      assert.equal(null, jwt.scope);

      done();
    });
  });
});
