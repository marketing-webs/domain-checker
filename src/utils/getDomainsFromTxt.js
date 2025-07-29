const fs = require('fs');
const path = require('path');

const getDomains = () => {
    const filePath = path.join(__dirname, '..', '..', 'domains.txt');

    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Błąd odczytu pliku:', err.message);
                return reject(err);
            }

            const domains = data
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(line => line.length > 0 && !line.startsWith('#'));

            resolve(domains);
        });
    });
};

module.exports.getDomains = getDomains