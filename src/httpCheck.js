const axios = require('axios');

const { getDomains } = require('./services/getDomainsFromTxt');
const { processInBatches } = require('./services/batchProcessor');

const { logger } = require('./utils/logger');
const { getErrorFromMessage } = require('./utils/errorUtils');

const checkRedirectChain = async (url) => {
    const chain = [];
    let currentUrl = url;
    let maxRedirects = 10;

    try {
        while (maxRedirects-- > 0) {
            const response = await axios.get(currentUrl, {
                maxRedirects: 0,
                validateStatus: () => true,
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                }
            });

            chain.push({
                url: currentUrl,
                statusCode: response.status,
            });

            if ([301, 302, 303, 307, 308].includes(response.status) && response.headers.location) {
                const location = response.headers.location;
                currentUrl = new URL(location, currentUrl).toString();
            } else {
                break;
            }
        }

        return { chain, error: null };
    } catch (error) {
        return { chain, error };
    }
};

const checkPage = async (url, withHttps, index) => {
    try {
        const timeUTCBefore = new Date().getTime()
        const domain = withHttps ? url.replace('https://', '') : url.replace('http://', '');;
        const { chain, error } = await checkRedirectChain(url);

        if (!chain || chain.length === 0 || error) {
            logger(`Brak odpowiedzi z ${domain}${error ? ` - ${error.message} - ${getErrorFromMessage(error.message)}` : ''}`, 'error');
            return;
        }

        const statuses = chain.map(response => response.statusCode).join(' >> ');
        const lastCode = chain[chain.length - 1].statusCode
        const time = new Date().getTime() - timeUTCBefore

        if (lastCode === 404) {
            return logger(`${statuses} ${domain} - Strona nie została znaleziona.`, 'warn');
        }

        if (lastCode === 410) {
            return logger(`${statuses} ${domain} - Strona na parkingu`, 'warn');
        }

        if (chain.find((status) => status.statusCode === 301 && !withHttps)) {
            return logger(`${statuses} ${domain} - ${time}ms`, 'success');
        }

        if (!withHttps) {
            return logger(`${statuses} ${domain} - Brak konfiguracji "Enforce HTTPS". ${time}ms`, 'warn');
        }

        logger(`[${index || 0}] ${statuses} ${domain} - ${time}ms`, 'success');
    } catch (error) {
        logger(`Błąd przy ${url} - ${time}ms ${error.message}`, 'error');
    }
};

const httpCheck = async (withHttps) => {
    const domains = await getDomains() || [];

    const checkDomain = async (domain, index) => {
        domain = domain.replace(/^https?:\/\//, '');

        if (withHttps) {
            domain = 'https://' + domain;
        } else {
            domain = 'http://' + domain;
        }

        await checkPage(domain, withHttps, index);
    };

    await processInBatches(domains, checkDomain, 50);
};

module.exports.httpCheck = httpCheck;