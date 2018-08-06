const InvalidTokenError = require('@compwright/oauth2-server/lib/errors/invalid-token-error');

module.exports = ({ redis }) => ({
    
    saveToken: (token, client, user, done) => {
        const transaction = redis.multi();

        transaction.hmset(token.accessToken, {
            accessToken: token.accessToken,
            accessTokenExpiresAt: token.accessTokenExpiresAt.valueOf(),
            scope: token.scope,
            client: JSON.stringify(client),
            user: JSON.stringify(user)
        });
        transaction.pexpireat(token.accessToken, token.accessTokenExpiresAt.valueOf());

        if (token.refreshToken) {
            transaction.hmset(token.refreshToken, {
                refreshToken: token.refreshToken,
                refreshTokenExpiresAt: token.refreshTokenExpiresAt.valueOf(),
                scope: token.scope,
                client: JSON.stringify(client),
                user: JSON.stringify(user),
            });
            transaction.pexpireat(token.refreshToken, token.refreshTokenExpiresAt.valueOf());
        }

        transaction.exec(err => {
            done(err, { ...token, client, user });
        });
    },

    getAccessToken: (accessToken, done) => {
        redis.hgetall(accessToken, (err, token) => {
            try {
                if (err) throw err;
                if (!token) throw new InvalidTokenError();
                token.accessTokenExpiresAt = new Date(token.accessTokenExpiresAt);
                token.client = JSON.parse(token.client);
                token.user = JSON.parse(token.user);
                done(null, token);
            } catch (e) {
                done(e);
            }
        });
    },

    getRefreshToken: (refreshToken, done) => {
        redis.hgetall(refreshToken, (err, token) => {
            try {
                if (err) throw err;
                if (!token) throw new InvalidTokenError();
                token.refreshTokenExpiresAt = new Date(token.refreshTokenExpiresAt);
                token.client = JSON.parse(token.client);
                token.user = JSON.parse(token.user);
                done(null, token);
            } catch (e) {
                done(e);
            }
        });
    },

    revokeToken: (token, done) => {
        return redis.del(token.refreshToken, (err, result) => {
            done(err, result > 0);
        });
    }
});
