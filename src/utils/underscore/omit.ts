import unset from "./unset";

const omit = <T, U extends keyof T>(obj: T, ...keys: U[]): Omit<T, U> => {
    const cloned = { ...obj };

    for(let key of keys) {
        unset(cloned, key);
    }

    return cloned;
};

export default omit;
