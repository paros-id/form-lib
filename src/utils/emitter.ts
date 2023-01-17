export type EventSet = { [key: string]: [...any] };
export type Listener<E extends EventSet, T extends keyof E> = (...args: E[T]) => void;

export interface Emitter<E extends EventSet = {}> {
    /**
     * Subscribe to an event
     * @param event Event name
     * @param callback Event handler
     */
    on<T extends keyof E>(event: T, listener: Listener<E, T>): void;

    /**
     * Unsubscribe from an event
     * @param event Event name
     * @param callback Event handler
     * @returns True if existed and successfully removed
     */
    once<T extends keyof E>(event: T, listener: Listener<E, T>): void;

    /**
     * Subscribe to the first instance of the event that occurs
     * @param event Event name
     * @param callback Event handler
     */
    off<T extends keyof E>(event: T, listener: Listener<E, T>): boolean;

    /**
     * Publish an event to the emitter
     * @param event Event name
     * @param args Event data
     */
    emit<T extends keyof E>(event: T, ...args: E[T]): boolean;

    /**
     * Remove all listeners for an event
     * @param event Event name
     */
     removeAllListeners<T extends keyof E>(event: T): boolean;
}

export class Emitter<E extends EventSet = {}> implements Emitter<E> {
    constructor() {
        extendEmitter(this);
    }

    on<T extends keyof E>(event: T, listener: Listener<E, T>) {}
    once<T extends keyof E>(event: T, listener: Listener<E, T>) {}
    off<T extends keyof E>(event: T, listener: Listener<E, T>) { return false; }
    emit<T extends keyof E>(event: T, ...args: E[T]) { return false; }
    removeAllListeners<T extends keyof E>(event: T) { return false; }
}

export const extendEmitter = <T extends EventSet, U extends object = {}>(obj: U): U & Emitter<T> => {
    let emitter = createEmitter<T>();
    Object.assign(obj, emitter);
    return obj as U & Emitter<T>;
};

export const createEmitter = <E extends EventSet = {}>() => {
    let listeners = new Map();

    const on = (event, listener) => {
        if(!listeners.has(event)) {
            listeners.set(event, new Set());
        }

        listeners.get(event).add(listener);
    };

    const off = (event, listener) => {
        if(!listeners.has(event))
            return false;

        return listeners.get(event).delete(listener);
    };

    const once = (event, listener) => {
        let wrapper = (...args) => {
            off(event, wrapper);
            return listener(...args);
        };

        on(event, wrapper);
    };

    const emit = (event, ...args) => {
        if(listeners.has(event) && listeners.get(event).size) {
            listeners.get(event).forEach(handler => handler(...args));
            return true;
        }

        return false;
    };

    const removeAllListeners = (event) => {
        return listeners.delete(event);
    };

    const emitter: Emitter<E> = { on, off, once, emit, removeAllListeners };
    return emitter;
};

export default createEmitter;
