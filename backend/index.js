require('dotenv').config();

require('./app/utils/messages');

const { mongodb, redis } = require('./app/utils');

const router = require('./app/routers');

(async () => {
    try {
        await mongodb.initialize();
        router.initialize();
        log.blue('🚘\n------------------------');
    } catch (err) {
        log.red(`reason: ${err.message}, stack: ${err.stack}`);
        process.exit(1);
    }
})();
