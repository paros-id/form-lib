import set from "./set";

const isSpecial = x => {
    const type = typeof x;

    return Array.isArray(x)
        || type === "function"
        || type === "object"
        || type === "symbol"
};

const traverseDeep = (found = {}, parent, base = "") => {
    for(let key in parent) {
        const isSpecialKey = isSpecial(key);
        const value = parent[key];
        const type = typeof value;

        let nestedKey;

        if(isSpecialKey) {
            // TODO: Store special keys and re-assign
        } else {
            nestedKey = base === "" ? key : `${base}.${key}`;
        }

        if(Array.isArray(value)) {
            traverseDeep(found, value, nestedKey);
        } else if(type === "function") {
            found[nestedKey] = value;
        } else if(type === "object") {
            traverseDeep(found, value, nestedKey);
        } else if(type === "symbol") {
            found[nestedKey] = value;
        }
    }

    return found;
}

const clone = <T>(obj: T): T => {
    let found = traverseDeep({}, obj);
    const stringified = JSON.stringify(obj);
    const cloned = JSON.parse(stringified);

    for(let key in found) {
        set(cloned, key, found[key]);
    }

    return cloned;
};

// export const clone = <T>(obj: T): T => {
//     if(obj instanceof Map) return new Map(obj) as unknown as T;
//     if(obj instanceof Set) return new Set(obj) as unknown as T;

//     if(Array.isArray(obj)) return [ ...obj ] as unknown as T;
//     if(typeof obj === "object") return { ...obj };

//     return obj;
// };

// export const cloneDeep = <T>(obj: T): T => {
//     if(obj instanceof Map) return new Map(obj) as unknown as T;
//     if(obj instanceof Set) return new Set(obj) as unknown as T;

//     if(Array.isArray(obj)) return [ ...obj ] as unknown as T;
//     if(typeof obj === "object") return { ...obj };

//     return obj;
// }

export default clone;
