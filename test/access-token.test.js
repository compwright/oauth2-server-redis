const assert = require('assert');
const redis = require('redis');
const mixin = require('../');

describe('Access Tokens', () => {
    let redisClient, api;

    const client = {
        id: 'acme'
    };

    const user = {
        name: 'pilot'
    };

    const token = {
        accessToken: '12345',
        accessTokenExpiresAt: new Date(Date.now() + 2000),
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
        
        it('should save the accessToken to Redis', done => {
            redisClient.hgetall(token.accessToken, (err, res) => {
                try {
                    if (err) throw err;
                    assert.deepEqual(res, {
                        accessToken: token.accessToken,
                        accessTokenExpiresAt: String(token.accessTokenExpiresAt.valueOf()),
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
        
        it('should set the accessToken expiration time in Redis', done => {
            redisClient.pttl(token.accessToken, (err, res) => {
                try {
                    if (err) throw err;
                    assert(res + Date.now() - token.accessTokenExpiresAt.valueOf() < 10); // 10ms tolerance
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
    });

    describe('getAccessToken()', () => {
        it('should return the expected object format', done => {
            api.getAccessToken(token.accessToken, (err, res) => {
                try {
                    if (err) throw err;
                    assert.deepEqual(res, { ...token, client, user });
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('should throw InvalidTokenError when not found', done => {
            api.getAccessToken('abc', (err, res) => {
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
});
