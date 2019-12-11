var mongoose    = require('mongoose'),
    redis       = require('redis'),
    util        = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
var client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);
var exec = mongoose.Query.prototype.exec;


mongoose.Query.prototype.exec = async () => {
    var key = JSON.stringify(
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        })
    );

    var cachedValue = await client.get(key);

    if (cachedValue) {
        console.log(cachedValue);
    }

    var result = await exec.apply(this, arguments);
    return result;
}