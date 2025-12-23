const { execSync } = require('child_process');

const getColor = (text, colorCode) => {
    return `\x1b[${colorCode}m${text}\x1b[0m`;
};

const red = (text) => getColor(text, 31);
const green = (text) => getColor(text, 32);
const yellow = (text) => getColor(text, 33);
const blue = (text) => getColor(text, 34);

const clearConsole = () => {
    try {
        if (process.platform === 'win32') {
            execSync('cls', { stdio: 'inherit' });
        } else {
            execSync('clear', { stdio: 'inherit' });
        }
    } catch (error) {
        process.stdout.write('\x1Bc');
        console.clear();
    }
};

const logger = (message, status = 'info') => {
    switch (status) {
        case 'success':
            console.info(green(`[V] ${message}`));
            break;
        case 'error':
            console.error(red(`[X] ${message}`));
            break;
        case 'warn':
            console.warn(yellow(`[V] ${message}`));
            break;
        case 'info':
        default:
            console.info(blue(message));
            break;
    }
};

module.exports = { logger, clearConsole };