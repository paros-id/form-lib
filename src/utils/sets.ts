export function filter<T>(set: Set<T>, predicate: (t: T) => boolean) {
    function* impl() {
        for(let value of set) {
            if(predicate(value)) {
                yield value;
            }
        }
    }

    return new Set(impl());
}

export function equals<T, U>(a: Set<T>, b: Set<U>) {
    if(a.size !== b.size) return false;
    // Not very efficient, but effective
    return new Set([...a, ...b]).size === a.size;
}
