const axios = require('axios');
const { getDomains } = require('./utils/getDomainsFromTxt');
const { cmdColor } = require('./utils/cmdColor');

const { green, red, yellow } = cmdColor

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

const checkPage = async (url, withHttps) => {
    try {
        const timeUTCBefore = new Date().getTime()
        const { chain, error } = await checkRedirectChain(url);

        if (!chain || chain.length === 0 || error) {
            console.info(red(`[X] Brak odpowiedzi z ${url}${error ? ` - ${error.message}` : ''}`));
            return;
        }

        const statuses = chain.map(response => response.statusCode).join(' >> ');
        const lastCode = chain[chain.length - 1].statusCode
        const time = new Date().getTime() - timeUTCBefore

        if (lastCode === 404) {
            return console.info(yellow(`[V] status ${statuses} ${url} - ${time}ms Strona nie została znaleziona.`));
        }

        if (lastCode === 410) {
            return console.info(yellow(`[V] status ${statuses} ${url} - ${time}ms Strona na parkingu`));
        }

        if (chain.find((status) => status.statusCode === 301 && !withHttps)) {
            return console.info(green(`[V] status ${statuses} ${url} - ${time}ms`));
        }

        if (!withHttps) {
            return console.info(yellow(`[V] status ${statuses} ${url} - ${time}ms Brak konfiguracji HTTPS na stronie`));
        }

        console.info(green(`[V] status ${statuses} ${url} - ${time}ms`));
    } catch (error) {
        console.error(red(`[X] Błąd przy ${url} - ${time}ms ${error.message}`));
    }
};

const httpCheck = async (withHttps) => {
    const domains = await getDomains() || [];

    for (let domain of domains) {
        domain = domain.replace('https://', '').replace('http://', '');

        if (withHttps) {
            domain = 'https://' + domain;
        } else {
            domain = 'http://' + domain;
        }

        await checkPage(domain, withHttps);
    }

    return true;
};

module.exports.httpCheck = httpCheck;