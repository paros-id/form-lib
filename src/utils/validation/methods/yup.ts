import ReactForm from "~/ReactForm";
import { ValidationError, reach, object } from "yup";
import get from "~/utils/underscore/get";
import set from "~/utils/underscore/set";
import merge from "~/utils/underscore/merge";

import type { ValidationResult } from "~/types/validators";
import { FormObject } from "~/types/ReactForm";

export async function validateYup<T extends FormObject>(form: ReactForm<T, "yup">, values: T, context: any = {}): Promise<ValidationResult<T> | null> {
    const { field, index } = context; // TODO: Index support for ArrayFieldAdapter
    const validator = form.validation;

    const getSubschema = field => {
        const subschema = reach(validator, field);
        const { refs } = subschema._whitelist;
        const built = {};
        const builtValues = {};

        set(built, field, subschema);
        set(builtValues, field, get(values, field));

        for(let [ , ref ] of refs) {
            const { validation, values } = getSubschema(ref.path);
            merge(built, validation);
            merge(builtValues, values);
        }

        return { validation: built, values: builtValues };
    };

    try {
        let result;
        if(field) {
            const processed = getSubschema(field);
            const subschema = object(processed.validation);
            const subset = processed.values;

            result = await subschema.validate(subset, {
                abortEarly: false,
                ...context.options
            });
        } else {
            result = await validator.validate(values, {
                abortEarly: false,
                ...context.options
            });
        }

        return {
            valid: true,
            errors: {},
            values: result,
        };
    } catch(ex: any) {
        if(ex instanceof ValidationError) {
            const errors = {};

            // TODO: Are there instances where full-form validation has no path?
            if(field) {
                set(errors, field, ex.inner[0].message);
            } else {
                for(const problem of ex.inner) {
                    set(errors, problem.path as string, problem.message);
                }
            }

            return {
                valid: false,
                errors,
                values,
            }
        }

        // TODO: Better general error handling
        const error = ex as any;
        // console.error(Object.keys(error), error?.name);
        return {
            valid: false,
            values,
            errors: {},
            error: error.message || "An unknown error has occurred"
        }
    }
}

export const validate = validateYup;
export default validateYup;
