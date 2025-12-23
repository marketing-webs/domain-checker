const fs = require('fs');
const path = require('path');

const readline = require('readline');
const { httpCheck } = require('./src/httpCheck');
const { dnsCheck } = require('./src/dnsCheck');
const { ghPagesCheck } = require('./src/ghPagesCheck');
const { cleanDnsCache } = require('./src/services/dnsCacheCleaner');

const { logger, clearConsole } = require('./src/utils/logger');

const filePath = path.join(process.cwd(), 'domains.txt');

function ensureDomainsFile() {
    return new Promise((resolve, reject) => {
        fs.access(filePath, (err) => {
            if (err) {
                fs.writeFile(filePath, '', (err2) => {
                    if (err2) {
                        logger(`Błąd podczas tworzenia pliku domains.txt: ${err2.message}`, 'error');
                        reject(err2);
                    } else {
                        logger('Utworzono nowy plik domains.txt. Proszę uzupełnić go domenami.', 'success');
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
    console.info('='.repeat(30))
    console.info('1. Sprawdź stronę HTTP (Zalecane)');
    console.info('2. Sprawdź stronę HTTP/s');
    console.info('='.repeat(30))
    console.info('3. Sprawdź DNS domen');
    console.info('4. Wyczyść cache DNS');
    console.info('='.repeat(30))
    console.info('5. Sprawdź status GitHub Pages');
    console.info('0. Wyjdź');

    rl.question('> ', async (answer) => {
        if (answer === '1') {
            clearConsole();
            console.info('Uruchomiono sprawdzanie HTTP...\n')
            await httpCheck();
            return showMenu();
        }

        if (answer === '2') {
            clearConsole();
            console.info('Uruchomiono sprawdzanie HTTPS...\n')
            await httpCheck(true);
            return showMenu();
        }

        if (answer === '3') {
            clearConsole();
            console.info('Uruchomiono sprawdzanie DNS...\n')
            await dnsCheck();
            return showMenu();
        }

        if (answer === '4') {
            clearConsole();
            console.info('Uruchomiono czyszczenie cache DNS...\n')
            await cleanDnsCache();
            return showMenu();
        }

        if (answer === '5') {
            clearConsole();
            console.info('Uruchomiono sprawdzanie GitHub Pages...\n')
            await ghPagesCheck();
            return showMenu();
        }

        if (answer === '0') {
            logger('👋 Zakończono.', 'success');
            rl.close();
            return;
        }

        logger('Nieznana opcja', 'error');
        showMenu();
    });
};

clearConsole()
showMenu();