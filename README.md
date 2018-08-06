# oauth2-server-redis

[![Build Status](https://travis-ci.org/compwright/oauth2-server-redis.svg?branch=master)](https://travis-ci.org/compwright/oauth2-server-redis)

Model mixin for [oauth2-server](https://github.com/compwright/node-oauth2-server) to store access tokens and refresh tokens in Redis

## Requirements

* Node.js 8+
* [oauth2-server](https://github.com/compwright/node-oauth2-server)
* Redis

## Installation

```bash
$ npm install --save @compwright/oauth2-server oauth2-server-redis
```

## Usage

```javascript
const OAuth2Server = require('@compwright/oauth2-server');
const redisStore = require('oauth2-server-redis');
const redis = require('redis');

const oauth = new OAuth2Server({
    model: {
        ...redisStore({
            redis: redis.createClient()
        })
    }
});
```

## License

MIT license
