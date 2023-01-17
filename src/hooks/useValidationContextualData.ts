import ReactForm from "~/ReactForm";

import { BuiltinTransformerRegistry } from "~/templates";
import type { FormValidationMethod } from "~/types/validators";
import type { TemplateRegistry } from "~/types/templates";
import { useMemo } from "react";
import get from "~/utils/underscore/get";
import { FormObject } from "~/types/ReactForm";

function useValidationContextualData<
    D extends FormObject,
    V extends FormValidationMethod,
    T extends TemplateRegistry = BuiltinTransformerRegistry
>(form: ReactForm<D, V, T>, field: string) {
    const validator = form.validation;

    return useMemo(() => {
        if(form.validationMethod === "yup") {
            const path = `fields.${field.split(".").join(".fields.")}`; // Yup internal schema layout for objects has a `fields` prop
            const subschema = get(validator, path);
            if(!subschema) return {};

            const label = subschema.spec.label as string;

            const props: any = {
                label,
                placeholder: label
            };

            if(subschema.spec.presence === "required") {
                props.required = true;
            }

            return props;
        }

        return {};
    }, [ form.validationMethod, validator, field ]);
}

export default useValidationContextualData;
