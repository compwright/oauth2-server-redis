const assert = require('assert');
const redis = require('redis');
const mixin = require('../');

describe('Refresh Tokens', () => {
    let redisClient, api;

    const client = {
        id: 'acme'
    };

    const user = {
        name: 'pilot'
    };

    const token = {
        accessToken: '123456',
        accessTokenExpiresAt: new Date(Date.now() + 2000),
        refreshToken: '654321',
        refreshTokenExpiresAt: new Date(Date.now() + 20000),
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

    describe('saveToken()', () => {
        it('should return the expected object format', done => {
            api.saveToken(token, client, user, (err, res) => {
                try {
                    if (err) throw err;
                    assert.deepEqual(res, { ...token, client, user });
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
        
        it('should save the refreshToken to Redis', done => {
            redisClient.hgetall(token.refreshToken, (err, res) => {
                try {
                    if (err) throw err;
                    assert.deepEqual(res, {
                        refreshToken: token.refreshToken,
                        refreshTokenExpiresAt: String(token.refreshTokenExpiresAt.valueOf()),
                        scope: token.scope,
                        client: JSON.stringify(client),
                        user: JSON.stringify(user)
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
        
        it('should set the refreshToken expiration time in Redis', done => {
            redisClient.pttl(token.refreshToken, (err, res) => {
                try {
                    if (err) throw err;
                    assert(res + Date.now() - token.refreshTokenExpiresAt.valueOf() < 10); // 10ms tolerance
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
    });

    describe('getRefreshToken()', () => {
        it('should return the expected object format', done => {
            api.getRefreshToken(token.refreshToken, (err, res) => {
                try {
                    if (err) throw err;
                    assert.deepEqual(res, { 
                        refreshToken: token.refreshToken,
                        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
                        scope: token.scope,
                        client,
                        user
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('should throw InvalidTokenError when not found', done => {
            api.getRefreshToken('abc', (err, res) => {
                try {
                    assert(err);
                    assert.equal(err.name, 'invalid_token');
                    assert.strictEqual(res, undefined);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
    });

    describe('revokeToken()', () => {
        it('should return true when the refreshToken is revoked', done => {
            api.revokeToken({
                refreshToken: token.refreshToken,
                refreshTokenExpiresAt: token.refreshTokenExpiresAt,
                scope: token.scope,
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

        it('should remove the refreshToken from Redis', done => {
            redisClient.hgetall(token.refreshToken, (err, res) => {
                try {
                    if (err) throw err;
                    assert.strictEqual(res, null);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('should return false when the refreshToken is not found', done => {
            api.revokeToken({
                refreshToken: token.refreshToken,
                refreshTokenExpiresAt: token.refreshTokenExpiresAt,
                scope: token.scope,
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
