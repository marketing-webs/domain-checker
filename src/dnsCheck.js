const dns = require('dns');
const { getDomains } = require('./utils/getDomainsFromTxt');
const { cmdColor } = require('./utils/cmdColor');
const { pause } = require('./utils/async');

const { green, red, yellow } = cmdColor

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

    const getErrorMsg = (errorMsg = '') => {
        const errors = {
            ENOTFOUND: "Domain does not exist (no such name in DNS)",
            ENODATA: "No A / AAAA record (domain exists but has no IP)",
            ETIMEOUT: "DNS server response took too long (timeout)",
            EAI_AGAIN: "Temporary DNS resolver issue (try again)",
            ECONNREFUSED: "Connection refused (server is up but nothing is listening on the port)",
            ECONNRESET: "Connection was reset by the host",
            EHOSTUNREACH: "Host unreachable (e.g. routing or network problem)",
            ENETUNREACH: "Network unreachable",
            EADDRNOTAVAIL: "Local IP address unavailable (rare)",
            EPIPE: "Broken connection (Broken pipe)",
            UNKNOWN: "Unknown DNS or network error",
        };

        for (const key of Object.keys(errors)) {
            if (errorMsg.includes(key)) {
                return `${errorMsg} - ${errors[key]}`;
            }
        }

        return errorMsg;
    };

    const getDNS = async () => {
        await new Promise((resolve) => {
            dns.lookup(url, (err, address, family) => {
                if (err) {
                    dnsInfo.message = getErrorMsg(err.message)
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
        return console.error(red(`[X] DNS error: ${url} - ${dnsInfo.message}`));
    }

    const successMsg = `[V] DNS OK: ${dnsInfo.message}${dnsInfo.retries ? ` retries: ${dnsInfo.retries} |` : ''} time: ${dnsInfo.timeout}ms ${url}`

    if (dnsInfo.status === "warn") {
        return console.info(yellow(`${successMsg} - timed out`));
    }

    console.info(green(successMsg));
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