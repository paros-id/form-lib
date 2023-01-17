import React from "react";
import ReactForm from "~/ReactForm";

import { BuiltinTransformerRegistry } from "~/templates";
import { FormObject, ReactFormOpts } from "~/types/ReactForm";
import { TemplateRegistry } from "~/types/templates";
import { FormValidationMethod } from "~/types/validators";


function useForm<
    D extends FormObject = {},
    V extends FormValidationMethod = "function",
    T extends TemplateRegistry = BuiltinTransformerRegistry
>(
    opts: ReactFormOpts<D, V, T> = {}
) {
    const val = React.useMemo(() => new ReactForm(opts), []);
    return val;
}

export default useForm;
