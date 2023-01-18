// Similar to omit, but without the clone

const without = <T extends object, U extends keyof T>(obj: T, ...keys: U[]): Omit<T, U> => {
    const clone = {} as T;
    const targetKeys = Object.keys(obj).filter(x => !keys.includes(x as any));

    for(const key of targetKeys) {
        clone[key] = obj[key];
    }

    return clone;
};

export default without;
