const readline = require('readline');
const { httpCheck } = require('./src/httpCheck');
const { dnsCheck } = require('./src/dnsCheck');

const fs = require('fs');
const path = require('path');

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
    console.log('\nWybierz opcję:');
    console.log('1. Sprawdź stronę HTTP');
    console.log('2. Sprawdź stronę HTTP/s');
    console.log('3. Sprawdź DNS domen');
    console.log('0. Wyjdź');

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

        if (answer === '0') {
            console.log('👋 Zakończono.');
            rl.close();
            return;
        }

        console.log('[X] Nieznana opcja');
        showMenu();
    });
};

showMenu();