const assert = require('assert');
const redis = require('redis');
const mixin = require('../');

describe('Authorization Codes', () => {
    let redisClient, api;

    const client = {
        id: 'acme'
    };

    const user = {
        name: 'pilot'
    };

    const code = {
        authorizationCode: '012345',
        expiresAt: new Date(Date.now() + 1000),
        redirectUri: 'https://oauth.test/redirect',
        scope: 'read write'
    };

    before(done => {
        redisClient = redis.createClient();
        api = mixin({ redis: redisClient });
        done();
    });

    after(done => {
        redisClient.quit();
        done();
    });

    describe('saveAuthorizationCode()', () => {
        it('should return the expected object format', done => {
            api.saveAuthorizationCode(code, client, user, (err, res) => {
                try {
                    if (err) throw err;
                    assert.deepEqual(res, { ...code, client, user });
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
        
        it('should save the authorizationCode to Redis', done => {
            redisClient.hgetall(code.authorizationCode, (err, res) => {
                try {
                    if (err) throw err;
                    assert.deepEqual(res, {
                        authorizationCode: code.authorizationCode,
                        expiresAt: String(code.expiresAt.valueOf()),
                        redirectUri: code.redirectUri,
                        scope: code.scope,
                        client: JSON.stringify(client),
                        user: JSON.stringify(user)
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
        
        it('should set the authorizationCode expiration time in Redis', done => {
            redisClient.pttl(code.authorizationCode, (err, res) => {
                try {
                    if (err) throw err;
                    assert(res + Date.now() - code.expiresAt.valueOf() < 10); // 10ms tolerance
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
    });

    describe('getAuthorizationCode()', () => {
        it('should return the expected object format', done => {
            api.getAuthorizationCode(code.authorizationCode, (err, res) => {
                try {
                    if (err) throw err;
                    assert.deepEqual(res, { ...code, client, user });
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('should throw AccessDeniedError when not found', done => {
            api.getAuthorizationCode('abc', (err, res) => {
                try {
                    assert(err);
                    assert.equal(err.name, 'access_denied');
                    assert.strictEqual(res, undefined);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
    });

    describe('revokeAuthorizationCode()', () => {
        it('should return true when the authorizationCode is revoked', done => {
            api.revokeAuthorizationCode({
                code: code.authorizationCode,
                expiresAt: code.expiresAt,
                scope: code.scope,
                redirectUri: code.redirectUri,
                client,
                user
            }, (err, res) => {
                try {
                    if (err) throw err;
                    assert.strictEqual(res, true);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('should remove the authorizationCode from Redis', done => {
            redisClient.hgetall(code.authorizationCode, (err, res) => {
                try {
                    if (err) throw err;
                    assert.strictEqual(res, null);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('should return false when the authorizationCode is not found', done => {
            api.revokeAuthorizationCode({
                code: code.authorizationCode,
                expiresAt: code.expiresAt,
                scope: code.scope,
                redirectUri: code.redirectUri,
                client,
                user
            }, (err, res) => {
                try {
                    if (err) throw err;
                    assert.strictEqual(res, false);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
    });
});
