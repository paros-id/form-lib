import type { SchemaOf } from "yup";

export type YupValidator<T extends {}> = SchemaOf<T>;
