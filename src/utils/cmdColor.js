function red(text) {
    return `\x1b[31m${text}\x1b[0m`;
}

function green(text) {
    return `\x1b[32m${text}\x1b[0m`;
}

const cmdColor = {
    green,
    red
}

module.exports.cmdColor = cmdColor