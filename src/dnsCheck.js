const dns = require('dns');
const { getDomains } = require('./utils/getDomainsFromTxt');
const { cmdColor } = require('./utils/cmdColor');
const { pause } = require('./utils/async');

const { green, red, yellow } = cmdColor

const config = {
    timeout: 3000,
    retries: 3
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
                    dnsInfo.message = err.message
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

    for (let attempt = 0; attempt < config.retries; attempt++) {
        const isLastAttempt = attempt === config.retries + 1;
        const utcTimeStart = new Date().getTime()

        if (isLastAttempt) {
            result = await getDNS(url);
        } else {
            result = await Promise.race([
                getDNS(url),
                pause(config.timeout)
            ]);
        }

        if (result) {
            dnsInfo.timeout = new Date().getTime() - utcTimeStart
            break;
        }
    }

    if (dnsInfo.retries === config.retries + 1) {
        dnsInfo.status = "warn"
    }

    if (dnsInfo.status === "error") {
        return console.error(red(`[X] DNS error for ${url}: ${dnsInfo.message}`));
    }

    if (dnsInfo.status === "warn") {
        return console.info(yellow(`[V] DNS OK for ${dnsInfo.message} Retries: ${dnsInfo.retries} ${url} ${dnsInfo.timeout}ms`));
    }

    console.info(green(`[V] DNS OK for ${dnsInfo.message}${dnsInfo.retries ? ` Retries: ${dnsInfo.retries} |` : ''} time: ${dnsInfo.timeout}ms ${url}`));
};

const dnsCheck = async () => {
    const domains = await getDomains() || [];

    for (const domain of domains) {
        const domainWithoutProtocol = domain
            .replace(/^https?:\/\//, '')
            .replace(/\/.*$/, '');

        await checkDns(domainWithoutProtocol);
    }

    return true;
};

module.exports.dnsCheck = dnsCheck;