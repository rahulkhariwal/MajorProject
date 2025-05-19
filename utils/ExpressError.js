class ExpressError extends Error {
    constructor(message, statusCode = 500) {
        super(message);  // Pass the message to the parent class
        this.statusCode = statusCode;
        this.name = this.constructor.name;  // Set the name of the error class
    }
}

module.exports = {ExpressError};  // Correct export statement

