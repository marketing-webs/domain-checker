const axios = require('axios');
const { processInBatches } = require('./services/batchProcessor');

const { logger } = require('./utils/logger');

const checkGlobalStatus = async () => {
    try {
        const response = await axios.get('https://www.githubstatus.com/api/v2/summary.json');
        const pagesComponent = response.data.components.find(c => c.name === 'Pages');

        if (pagesComponent) {
            if (pagesComponent.status === 'operational') {
                logger(`Globalny status GitHub Pages: ${pagesComponent.status}`, 'success');
            } else {
                logger(`Globalny status GitHub Pages: ${pagesComponent.status}`, 'warn');
            }
        } else {
            logger('Nie znaleziono komponentu GitHub Pages w status API', 'warn');
        }
    } catch (error) {
        logger(`Nie udało się pobrać globalnego statusu: ${error.message}`, 'error');
    }
};

const ghPagesCheck = async () => {
    await checkGlobalStatus();

    const checkIp = async (ip) => {
        const timeStart = new Date().getTime();
        try {
            const response = await axios.head(`https://${ip}`, {
                headers: {
                    'Host': 'github.github.io'
                },
                httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
                timeout: 3000,
                validateStatus: () => true
            });

            const time = new Date().getTime() - timeStart;

            if (response.status >= 500) {
                logger(`Serwer ${ip} zwrócił błąd (Status: ${response.status}) - ${time}ms`, 'error');
                return false;
            }

            logger(`Serwer ${ip} działa - ${time}ms`, 'success');
            return true;
        } catch (error) {
            const time = new Date().getTime() - timeStart;
            logger(`Serwer ${ip} nie odpowiada: ${error.message} - ${time}ms`, 'error');
            return false;
        }
    };

    const ips = [
        '185.199.108.153',
        '185.199.109.153',
        '185.199.110.153',
        '185.199.111.153',
    ];

    await processInBatches(ips, checkIp, 4);

    return true;
};

module.exports.ghPagesCheck = ghPagesCheck;
