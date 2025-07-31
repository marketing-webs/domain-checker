const getColor = (text, colorCode) => {
    return `\x1b[${colorCode}m${text}\x1b[0m`;
};

const red = (text) => getColor(text, 31);
const green = (text) => getColor(text, 32);
const yellow = (text) => getColor(text, 33);

const cmdColor = {
    green,
    red,
    yellow
}

module.exports.cmdColor = cmdColor