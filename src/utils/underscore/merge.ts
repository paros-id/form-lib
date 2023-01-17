const isObject = obj => obj && obj.constructor === Object;
const isArray = obj => Array.isArray(obj);
const replaceValue = (value, newValue) => {
    if(isArray(value) && isArray(newValue)) {
        return newValue.map((val, i) => replaceValue(value[i], val));
    }

    if(isObject(value) && isObject(newValue)) {
        return merge(value, newValue);
    }

    return newValue;
};

type OptionalPropertyNames<T> =
  { [K in keyof T]-?: ({} extends { [P in K]: T[K] } ? K : never) }[keyof T];

type SpreadProperties<L, R, K extends keyof L & keyof R> =
  { [P in K]: L[P] | Exclude<R[P], undefined> };

type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

type SpreadTwo<L, R> = Id<
  & Pick<L, Exclude<keyof L, keyof R>>
  & Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>>
  & Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>>
  & SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>
>;

type Spread<A extends readonly [...any]> = A extends [infer L, ...infer R] ?
  SpreadTwo<L, Spread<R>> : unknown

const merge = <A, B extends any[]>(target: A, ...sources: [...B]) => {
    type Merged = Spread<[A, ...B]>;

    for(let source of sources) {
        for(let key in source) {
            if(source[key] === null) continue;
            (target as Merged)[key] = replaceValue((target as Merged)[key], source[key]);
        }
    }

    return target as Merged;
};

export default merge;
