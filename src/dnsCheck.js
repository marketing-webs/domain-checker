const dns = require('dns');
const { getDomains } = require('./utils/getDomainsFromTxt');
const { cmdColor } = require('./utils/cmdColor');

const { green, red } = cmdColor

const checkDns = (url) => {
    return new Promise((resolve) => {
        dns.lookup(url, (err, address, family) => {
            if (err) {
                console.error(red('[X] DNS problem:', err.message));
                resolve();
            } else {
                console.log(green(`[V] DNS OK: ${address} (IPv${family})`));
                resolve();
            }
        });
    });
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