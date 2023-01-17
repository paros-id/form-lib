import { useContext } from "react";
import useFormProp from "./hooks/useFormProp";
import MetadataContext from "./MetadataContext";

import type ReactForm from "./ReactForm";
import { FormObject } from "./types/ReactForm";
import type { TemplateRegistry } from "./types/templates";
import type { FormValidationMethod } from "./types/validators";

export type ComponentType = React.FunctionComponent<{}>;

export function createFormError<
    D extends FormObject,
    V extends FormValidationMethod,
    T extends TemplateRegistry
>(form: ReactForm<D, V, T>): ComponentType {
    return function FormError() {
        const error = useFormProp<string>(form, "error");

        if(!error) return null;
        return error;
    } as ComponentType;
}

function FormError() {
    const { form } = useContext(MetadataContext);
    const error = useFormProp<string>(form, "error");

    if(!error) return null;
    return error;
}

export default FormError;
