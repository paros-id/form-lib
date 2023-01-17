// Because get() will return null or undefined, we can't do standard truthy/falsy or === undefined operations.
// This lets us conveniently check if something genuinely isn't defined because Symbol() generates a unique symbol every time
export const UNDEFINED = Symbol("undefined");

// Used by ArrayFieldAdapter to selectively handle validation for subsections of a row
export const ARRAY_INDEX = Symbol("array_index");

export const IS_ARRAY_ADAPTER = Symbol("array_adapter");
