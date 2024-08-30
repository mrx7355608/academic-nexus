class ApiError {
    public message: string;
    public status: number;

    constructor(message: string, status: number) {
        this.message = message;
        this.status = status;
        Error.captureStackTrace(this);
    }
}

export default ApiError;
