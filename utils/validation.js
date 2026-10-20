
/**
 * Checks whether an ID is a positive whole number.
 */
function isValidId(id) {
    const numericId = Number(id);

    return Number.isInteger(numericId) && numericId > 0;
}


/**
 * Checks whether text contains at least one English letter.
 */
function isValidText(text) {
    const textPattern = /[A-Za-z]/;

    return textPattern.test(text);
}


/**
 * Checks whether a date is a real date in YYYY-MM-DD format.
 */
function isValidDate(date) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(date)) {
        return false;
    }

    const [year, month, day] = date.split("-").map(Number);

    const dateObject = new Date(year, month - 1, day);

    return (
        dateObject.getFullYear() === year &&
        dateObject.getMonth() === month - 1 &&
        dateObject.getDate() === day
    );
}


/**
 * Checks whether an amount is a valid number greater than zero.
 */
function isValidAmount(amount) {
    const numericAmount = Number(amount);

    return Number.isFinite(numericAmount) && numericAmount > 0;
}


// Export the functions so other files can use them.
module.exports = {
    isValidId,
    isValidText,
    isValidDate,
    isValidAmount
};
