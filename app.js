const readline = require('readline');
const { httpCheck } = require('./src/httpCheck');
const { dnsCheck } = require('./src/dnsCheck');

const fs = require('fs');
const path = require('path');
const { ghPagesCheck } = require('./src/ghPagesCheck');

const filePath = path.join(process.cwd(), 'domains.txt');

function ensureDomainsFile() {
    return new Promise((resolve, reject) => {
        fs.access(filePath, (err) => {
            if (err) {
                fs.writeFile(filePath, '', (err2) => {
                    if (err2) reject(err2);
                    else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    });
}

ensureDomainsFile()

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const showMenu = () => {
    console.info('\nWybierz opcję:');
    console.info('1. Sprawdź stronę HTTP');
    console.info('2. Sprawdź stronę HTTP/s');
    console.info('3. Sprawdź DNS domen');
    // console.info('4. Sprawdź serwer gh-pages');
    console.info('0. Wyjdź');

    rl.question('> ', async (answer) => {
        if (answer === '1') {
            await httpCheck();
            return showMenu();
        }

        if (answer === '2') {
            await httpCheck(true);
            return showMenu();
        }

        if (answer === '3') {
            await dnsCheck();
            return showMenu();
        }

        // if (answer === '4') {
        //     await ghPagesCheck();
        //     return showMenu();
        // }

        if (answer === '0') {
            console.info('👋 Zakończono.');
            rl.close();
            return;
        }

        console.info('[X] Nieznana opcja');
        showMenu();
    });
};

showMenu();