export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockApiError extends Error {
    constructor(public message: string, public status: number) {
        super(message);
    }
}
