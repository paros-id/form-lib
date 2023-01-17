import ReactForm from "~/ReactForm";
import { ValidationContext } from ".";
import { FormObject } from "../ReactForm";
import { Errors } from "./errors";

export type FunctionValidationResult = {
    valid?: boolean;
    error?: string;
};

export type FunctionValidator<T, U = FunctionValidationResult | void> = (values: T, errors: Errors<T>, context?: ValidationContext) =>
    U extends void
        ? (void | Promise<void>)
        : FunctionValidationResult | Promise<FunctionValidationResult>;

export type FuncValidationWrapper<T extends FormObject> = (form: ReactForm<T>) => Promise<void>;
