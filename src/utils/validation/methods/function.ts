import ReactForm from "~/ReactForm";
import { ValidationResult } from "~/types/validators";

function createResultObj() {
    const result = {

    }
}

export async function validateFunc<T>(form: ReactForm<T, "function">, values: T, context: any = {}): Promise<ValidationResult<T> | null> {
    const { field, cause } = context || {};

    if((cause === "blur" && !form.validateOnBlur) || typeof form.validation !== "function") {
        return { skipped: true };
    }

    const errors = {};
    let res = await form.validation(values, errors, context);

    return {
        valid: res?.valid || (res?.hasOwnProperty("error") && !res.error) || !Object.keys(errors).length,
        error: res?.error || undefined,
        errors, values
    };
}

export const validate = validateFunc;
export default validateFunc;
