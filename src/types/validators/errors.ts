export type Errors<T> = {
    [key in keyof T]?: string | Errors<T[key]>;
};
