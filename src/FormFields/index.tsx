import ReactForm from "../ReactForm";
import createField from "./Field";

import { FormValidationMethod } from "../types/validators";
import { BuiltinTransformerRegistry } from "~/templates";
import { TemplateRegistry } from "~/types/templates";
import { FormObject } from "~/types/ReactForm";

export const FORM = Symbol("form");
export const CACHE = Symbol("cached_fields");

// When accessing properties of FormFields, we pass these through normally
const IGNORED_PROPS = [ FORM, CACHE ];

export class FormFields<
    D extends FormObject = {},
    V extends FormValidationMethod = "function",
    T extends TemplateRegistry = BuiltinTransformerRegistry
> {
    // We use symbols to avoid any conflict with field names
    private [FORM]: ReactForm<D, V, T>;
    private [CACHE]: any = {};

    constructor(form: ReactForm<D, V, T>) {
        this[FORM] = form;
    }

    get(self, prop) {
        if(IGNORED_PROPS.includes(prop)) return self[prop];

        if(self[CACHE][prop])
            return self[CACHE][prop];

        const field = createField(self, self[FORM], prop);
        self[CACHE][prop] = field;

        return field;
    }
}

function createFormFields<
    D extends FormObject,
    V extends FormValidationMethod,
    T extends TemplateRegistry
>(form: ReactForm<D, V, T>) {
    let fields = new FormFields<D, V, T>(form);
    return new Proxy(fields, fields);
}

export default createFormFields;
