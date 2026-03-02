type EventHandler = (...args: unknown[]) => void;

class EventEmitter {
    private events: Map<string, EventHandler[]> = new Map();

    on(event: string, handler: EventHandler): () => void {
        if (!this.events.has(event)) this.events.set(event, []);
        this.events.get(event)!.push(handler);
        return () => this.off(event, handler);
    }

    off(event: string, handler: EventHandler): void {
        const handlers = this.events.get(event);
        if (handlers) {
            this.events.set(event, handlers.filter((h) => h !== handler));
        }
    }

    emit(event: string, ...args: unknown[]): void {
        const handlers = this.events.get(event);
        if (handlers) handlers.forEach((h) => h(...args));
    }

    removeAllListeners(event?: string): void {
        if (event) this.events.delete(event);
        else this.events.clear();
    }
}

export const globalEmitter = new EventEmitter();
export default EventEmitter;
