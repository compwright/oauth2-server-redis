# oauth2-server-redis

[![Build Status](https://app.travis-ci.com/compwright/oauth2-server-redis.svg?branch=master)](https://app.travis-ci.com/compwright/oauth2-server-redis)
[![Download Status](https://img.shields.io/npm/dm/oauth2-server-redis.svg?style=flat-square)](https://www.npmjs.com/package/oauth2-server-redis)
[![Sponsor on GitHub](https://img.shields.io/static/v1?label=Sponsor&message=❤&logo=GitHub&link=https://github.com/sponsors/compwright)](https://github.com/sponsors/compwright)

Redis storage backend for [oauth2-server](https://github.com/compwright/node-oauth2-server)

## Features

* Stores the following in Redis:
    * Access tokens
    * Refresh tokens
    * Authorization codes
* Uses `HMSET` to store all data as keys (the token or code is the hash)
* Respects TTL settings so that entries expire at the right time

## Requirements

* Node.js 10+
* [oauth2-server](https://github.com/compwright/node-oauth2-server)
* [redis](https://www.npmjs.com/package/redis)

## Installation

```bash
$ npm install --save @compwright/oauth2-server oauth2-server-redis redis
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
