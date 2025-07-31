const axios = require('axios');

const ghPagesCheck = async () => {
    const checkIp = async (ip) => {
        try {
            const response = await axios.head(`https://${ip}`, {
                headers: {
                    'Host': 'marketing-webs.github.io'
                },
                httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
                timeout: 3000,
            });
            console.log(response.status)
            return response.status >= 200 && response.status < 300;
        } catch (error) {
            console.error(error.response.status)
            return false;
        }
    };

    const ips = [
        '185.199.108.153',
        '185.199.109.153',
        '185.199.110.153',
        '185.199.111.153',
    ];

    (async () => {
        for (const ip of ips) {
            const isUp = await checkIp(ip);


        }
        return true
    })();
}

module.exports.ghPagesCheck = ghPagesCheck;