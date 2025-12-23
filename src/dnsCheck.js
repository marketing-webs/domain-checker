const dns = require('dns');
const { getDomains } = require('./services/getDomainsFromTxt');
const { processInBatches } = require('./services/batchProcessor');

const { getErrorFromMessage } = require('./utils/errorUtils');
const { pause } = require('./utils/async');
const { logger } = require('./utils/logger');

const config = {
    timeout: 2000,
    retries: 2
};

const checkDns = async (url) => {
    const dnsInfo = {
        timeout: 0,
        retries: 0,
        status: '',
        url
    }

    const getDNS = async () => {
        await new Promise((resolve) => {
            dns.lookup(url, (err, address, family) => {
                if (err) {
                    dnsInfo.message = getErrorFromMessage(err.message)
                    dnsInfo.status = 'error'
                    resolve();
                } else {
                    dnsInfo.message = `${address} (IPv${family})`
                    dnsInfo.status = 'ok'
                    resolve();
                }
            });
        });

        return dnsInfo
    }

    const utcTimeStart = new Date().getTime()

    for (let attempt = 0; attempt <= config.retries; attempt++) {
        const isLastAttempt = attempt === config.retries;

        if (isLastAttempt) {
            result = await getDNS(url);
        } else {
            result = await Promise.race([
                getDNS(url),
                pause(config.timeout)
            ]);
        }

        if (result) {
            dnsInfo.retries = attempt
            dnsInfo.timeout = new Date().getTime() - utcTimeStart
            break;
        }
    }

    if (dnsInfo.retries === config.retries && dnsInfo.timeout >= (config.timeout / config.retries)) {
        dnsInfo.status = "warn"
    }

    if (dnsInfo.status === "error") {
        return logger(`Błąd DNS: ${url} - ${dnsInfo.message}`, 'error');
    }

    const successMsg = `DNS OK: ${dnsInfo.message}${dnsInfo.retries ? ` próby: ${dnsInfo.retries + 1} |` : ''} czas: ${dnsInfo.timeout}ms ${url}`

    if (dnsInfo.status === "warn") {
        return logger(`${successMsg} - zbyt długo`, 'warn');
    }

    logger(successMsg, 'success');
};

const dnsCheck = async () => {
    const domains = await getDomains() || [];

    const checkDomain = async (domain) => {
        const domainWithoutProtocol = domain
            .replace(/^https?:\/\//, '')
            .replace(/\/.*$/, '');

        await pause(100)
        await checkDns(domainWithoutProtocol);
    };

    await processInBatches(domains, checkDomain, 50);
};

module.exports.dnsCheck = dnsCheck;