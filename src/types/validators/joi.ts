export type JoiValidationResult<T> = {
    error: any;
    value: T;
};

export type JoiValidator<T, U = T> = {
    validate(value: T, options?: any): JoiValidationResult<U>;
};

