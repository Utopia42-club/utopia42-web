export class UtopiaError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UtopiaError';
    }
}
