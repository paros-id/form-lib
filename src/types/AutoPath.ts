type _StringKeys<T, X = never> = keyof T extends infer K
    ? K extends keyof T
        ? T[K] extends X ? never : K
        : never
    : never;

type __StringKeys<T, K> = `${K & string}` | (
    [T] extends [readonly any[]]
        ? number extends T["length"]
            ? number extends K
                ? `${bigint}`
                : `${K & number}`
            : never
        : number extends K
            ? `${bigint}`
            : `${K & number}`
);

type StringKeys<T, X = never> = __StringKeys<T, _StringKeys<T, X>>;

type NonHomomorphicKeyof<T> = keyof T extends infer K ? Extract<K, keyof T> : never;

type GetStringKey<T, K extends StringKeys<T, X>, X = never> = {
    [K2 in NonHomomorphicKeyof<T>]: K extends __StringKeys<T, K2> ? T[K2] : never
}[NonHomomorphicKeyof<T>]

export type DotPath<O, P extends string = '', V = unknown, X = (...args: any) => any> =
    (P & `${string}.` extends never ? P : P & `${string}.`) extends infer Q
    ? Q extends `${infer A}.${infer B}`
        ? A extends StringKeys<O, X>
                ? `${A}.${DotPath<GetStringKey<O, A, X>, B, V>}`
                : never
        : Q extends StringKeys<O, X>
                ? (GetStringKey<O, Q, X> extends V ? Exclude<P, `${string}.`> : never)
                | (StringKeys<GetStringKey<O, Q, X>, X> extends never ? never : `${Q}.`)
                : StringKeys<O, X>
                | (Q extends "" ? `${bigint}` extends StringKeys<O, X> ? "[index]" : never : never)
    : never

// export type DotValue<O, P extends string> =
//     P extends `${infer A}.${infer B}`
//         ? A extends StringKeys<O>
//             ? DotValue<GetStringKey<O, A>, B>
//             : never
//         : P extends StringKeys<O>
//             ? GetStringKey<O, P>
//             : never;

export type DotValue<O, P> =
P extends `${infer A}.${infer B}`
    ? A extends StringKeys<O>
        ? DotValue<GetStringKey<O, A>, B>
        : never
    : P extends StringKeys<O>
        ? GetStringKey<O, P>
        : never;
