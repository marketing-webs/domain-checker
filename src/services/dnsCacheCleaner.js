const util = require('util');
const { exec } = require('child_process');

const { logger } = require('../utils/logger');

const execAsync = util.promisify(exec);

const cleanDnsCache = async () => {
    if (process.platform !== 'win32') {
        return logger('Czyszczenie cache DNS jest obecnie obsługiwane tylko na systemie Windows.', 'error');
    }

    try {
        await execAsync('ipconfig /flushdns');
        logger('Cache DNS wyczyszczony', 'success');
    } catch (e) {
        logger(`Błąd czyszczenia DNS (DNS Cache cleaner): ${e.message}`, 'error');
    }
}

module.exports.cleanDnsCache = cleanDnsCache;