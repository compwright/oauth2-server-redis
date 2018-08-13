# oauth2-server-redis

[![Build Status](https://travis-ci.org/compwright/oauth2-server-redis.svg?branch=master)](https://travis-ci.org/compwright/oauth2-server-redis) [![Greenkeeper badge](https://badges.greenkeeper.io/compwright/oauth2-server-redis.svg)](https://greenkeeper.io/)

Redis storage backend for [oauth2-server](https://github.com/compwright/node-oauth2-server)

## Features

* Stores the following in Redis:
    * Access tokens
    * Refresh tokens
    * Authorization codes
* Uses `HMSET` to store all data as keys (the token or code is the hash)
* Respects TTL settings so that entries expire at the right time

## Requirements

* Node.js 8+
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
