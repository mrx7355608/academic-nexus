class ApiError {
    constructor(message, status) {
        this.message = message;
        this.status = status;
        Error.captureStackTrace(this);
    }
}

export default ApiError;
