function formatNumbers(number) {
    if (number < 1000) { return number; }
    return number.toLocaleString('en-US');
}

module.exports = formatNumbers;