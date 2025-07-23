const { createClient } = require ('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-12324.crce179.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 12324
    }
});


module.exports = redisClient;