import ReactForm from "~/ReactForm";

import { FormErrors, FormObject } from "../ReactForm";
import { TemplateRegistry } from "../templates";
import { FunctionValidator, FuncValidationWrapper } from "./function";
import { JoiValidator } from "./joi";
import { YupValidator } from "./yup";

export type FormValidationMethod = "infer" | "function" | "joi" | "yup" | "ajv";

export type ValidationContext = {
    field?: string;
    cause?: string;
    [key: string]: any;
};

export type ValidationResult<T extends FormObject> = {
    skipped?: boolean;
    valid?: boolean,
    error?: any;
    errors?: FormErrors<T>,
    values?: T
};

export type ValidationMethods<T extends FormObject> = {
    "infer": unknown;
    "function": FunctionValidator<T>;
    "yup": YupValidator<T>;
    "joi": JoiValidator<T>;
    "ajv": unknown;
}

export type ValidatorWrapper<D extends FormObject, U extends FormValidationMethod, T extends TemplateRegistry> = {
    validate: (form: ReactForm<D, U, T>, values: D, options?: any) => Promise<ValidationResult<D>>;
};

export type ValidationWrappers<T extends FormObject> = {
    "infer": unknown;
    "function": FuncValidationWrapper<T>;
    "yup": YupValidator<T>;
    "joi": JoiValidator<T>;
    "ajv": unknown;
}
