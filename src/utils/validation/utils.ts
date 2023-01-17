export const mergeJoiOptions = (options: any = {}) => ({
    allowUnknown: true,
    abortEarly: false,
    ...options,
    errors: {
        ...options?.errors,
        wrap: {
            label: "",
            ...options?.errors?.wrap
        }
    },
    messages: {
        "string.base": "{{#label}} is required",
        "string.empty": "{{#label}} is required",
        "string.pattern.base": "{{#label}} must be valid",
        ...options?.messages
    }
});
