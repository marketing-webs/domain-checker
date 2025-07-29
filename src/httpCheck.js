const axios = require('axios');
const { getDomains } = require('./utils/getDomainsFromTxt');
const { cmdColor } = require('./utils/cmdColor');

const { green, red } = cmdColor

const checkRedirectChain = async (url) => {
    const chain = [];
    let currentUrl = url;
    let maxRedirects = 10;

    try {
        while (maxRedirects-- > 0) {
            const response = await axios.get(currentUrl, {
                maxRedirects: 0,
                validateStatus: () => true,
                timeout: 5000,
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

const checkPage = async (url) => {
    try {
        const { chain, error } = await checkRedirectChain(url);

        if (!chain || chain.length === 0 || error) {
            console.log(red(`[X] Brak odpowiedzi z ${url}${error ? ` | ${error.message}` : ''}`));
            return;
        }

        const statuses = chain.map(r => r.statusCode).join(' ➞  ');

        if (statuses.split(' ').includes('200')) {
            console.log(green(`[V] status ${statuses} ${url}`));
        } else {
            console.log(red(`[V] status ${statuses} ${url} - brak odpowiedzi 200`));
        }

    } catch (error) {
        console.error(red(`[X] Błąd przy ${url}: ${error.message}`));
    }
};

const httpCheck = async (withHttps) => {
    const domains = await getDomains() || [];

    for (let domain of domains) {
        if (withHttps) {
            if (domain.startsWith('http://')) {
                domain = domain.replace('http://', 'https://');
            } else if (!domain.startsWith('https://')) {
                domain = 'https://' + domain;
            }
        } else {
            if (domain.startsWith('https://')) {
                domain = domain.replace('https://', 'http://');
            } else if (!domain.startsWith('http://')) {
                domain = 'http://' + domain;
            }
        }

        await checkPage(domain);
    }

    return true;
};

module.exports.httpCheck = httpCheck;