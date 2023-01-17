import { createFieldWatcherComponent, HookedFieldWatcher } from "./FieldWatcher";
import { createFormComponent, HookedFormComponent } from "./Form";
import { ComponentType as FormErrorComponent, createFormError } from "./FormError";
import createFormFields from "./FormFields";
import FormObjectComponent from "./FormObject";

import LogicBindings, { HookFieldOpts } from "./utils/LogicBindings";
import createFormPropBinder, { FormPropBinder } from "./utils/FormPropBinder";
import { Emitter, Listener } from "./utils/emitter";
import { propertyExists } from "./utils/properties";
import { validateForm } from "./utils/validation";

import get from "./utils/underscore/get";
import set from "./utils/underscore/set";
import uniq from "./utils/underscore/uniq";
import unset from "./utils/underscore/unset";

import { UNDEFINED } from "./symbols";

import {
    filter as filterSet,
    equals as setsEqual
} from "./utils/sets";

import { FormValidationMethod, ValidationMethods, ValidationResult } from "./types/validators";
import { BuiltinTransformerRegistry, _transformers } from "./templates";
import { FormFieldComponent } from "./FormFields/Field";
import { TemplateRegistry } from "./types/templates";
import { DotPath } from "./types/AutoPath";
import useFormEffect, { FormEffectHook } from "./hooks/useFormEffect";

import {
    BulkFieldFunc,
    BulkMutatorFunc,
    ChangeFunc,
    ErrorMutatorFunc,
    EventFunc,
    Events,
    FieldFunc,
    FormErrors,
    MultiPropFunc,
    MutatorFunc,
    PropFunc,
    ReactFormOpts,
    ValidateArgs,
    FormObject
} from "./types/ReactForm";

const defaultProps = {
    disabled: false
};

export default class ReactForm<
    D extends FormObject = {},
    V extends FormValidationMethod = "function",
    T extends TemplateRegistry = BuiltinTransformerRegistry
> extends Emitter<Events<D>> {
    private _errors: FormErrors<D> = {};
    private _values: D = {} as D;
    private initialValues = {};
    private initialErrors = {};
    private initialProps = {};

    private fields = new Set<DotPath<D>>();
    private disabled = new Set<DotPath<D>>();
    private valid = new Set<DotPath<D>>();

    private properties: { [key: string]: any } = {};

    Form: HookedFormComponent<D, V, T>;
    FieldWatcher: HookedFieldWatcher<D, V, T>;
    Fields: { [field: string]: FormFieldComponent<D, V, T>; };
    FormObject = FormObjectComponent;
    FormError: FormErrorComponent;

    name: string;
    validateOnBlur: boolean;
    validation: ValidationMethods<D>[V];
    validationMethod: V;
    templates: T;

    // Self reference for destructuring purposes
    form: ReactForm<D, V, T>;

    hookField: (opts: HookFieldOpts) => any;
    withFormProp: FormPropBinder;
    useFormEffect: FormEffectHook<D>;

    constructor({
        name = "form",

        debugUpdates = !!localStorage.getItem("form:debug:updates"),
        debugChanges = !!localStorage.getItem("form:debug:changes"),

        validateOnBlur = true,
        // @ts-expect-error Default to function-based validation
        validation = () => {},
        // @ts-expect-error Default to function-based validation
        validationMethod = "function",

        initialValues = {},
        initialErrors = {},
        initialProps = {},
        disabledFields = [],

        templates = _transformers as unknown as T,

        onSubmit,
        onChange,
        onError,
        onUpdate,
    }: ReactFormOpts<D, V, T> = {}) {
        super();

        this.form = this;
        this.name = name;
        this.validateOnBlur = validateOnBlur;
        this.disabled = new Set([...disabledFields]);
        this.initialValues = initialValues;
        this.initialErrors = initialErrors;
        this.initialProps = initialProps;
        this.validation = validation;
        this.validationMethod = validationMethod;
        this.templates = templates;
        this.properties = { ...defaultProps, ...initialProps };

        this._values = { ...this.initialValues } as D;
        this._errors = { ...this.initialErrors };

        this.Form = createFormComponent(this);
        this.FieldWatcher = createFieldWatcherComponent(this);
        this.Fields = createFormFields(this);
        this.FormError = createFormError(this);
        this.withFormProp = createFormPropBinder(this);

        this.useFormEffect = (
            effect,
            fields
        ) => {
            return useFormEffect(effect, fields, this);
        }

        if(onSubmit) this.on("submit", onSubmit);
        if(onChange) this.on("change", onChange);
        if(onError) this.on("errors", onError);
        if(onUpdate) this.on("update", onUpdate);

        if(debugUpdates) this.on("update", console.log.bind(console, `${name}-update`));
        if(debugChanges) this.on("change", console.log.bind(console, `${name}-change`));

        let logic = new LogicBindings<D>({
            getError: field => get(this._errors, field),
            getValue: field => get(this._values, field),

            setError: (field, error, update) => set(this._errors, field, error),
            setValue: ({ field, value, previousValue, callback, update }) => {
                set(this._values, field, value);

                if(update) {
                    this.change({ field, previousValue, callback: typeof callback === "function" ? callback : undefined });
                }
            },

            delError: field => unset(this._errors, field),
            delValue: field => unset(this._values, field),

            hasValue: field => propertyExists(this._values, field),
            isDisabled: field => this.disabled.has(field as DotPath<D>),

            validateOnBlur: () => this.validateOnBlur,
            validate: this.validate.bind(this) as any,
        });

        this.hookField = logic.hookField;
    }

    prop: PropFunc = (...args) => {
        if(args.length === 2) {
            this.properties[args[0]] = args[1];
            this.emit("prop", args[0], args[1]);
            return args[1];
        }

        return this.properties[args[0]];
    };

    props: MultiPropFunc = (...args) => {
        if(args.length === 1 && typeof args[0] === "object") {
            return Object.keys(args[0]).forEach(key => this.prop(key, args[0][key]))
        }

        return args.reduce((obj, key) => ({
            ...obj,
            [key]: this.properties[key]
        }), {});
    };

    onChange: EventFunc<D, "__change_field", "change"> = (...listeners) => {
        if(typeof listeners[0] === "string" && listeners.length > 1) {
            // On change specific field
            const event = `change-${listeners[0]}` as keyof Events<D>;
            listeners.slice(1).map(x => this.on(event, x));
        } else {
            // Generalized on change
            listeners.map(x => this.on("change", x));
        }
    };

    offChange: EventFunc<D, "__change_field", "change"> = (...listeners) => {
        if(typeof listeners[0] === "string" && listeners.length > 1) {
            // On change specific field
            const event = `change-${listeners[0]}` as keyof Events<D>;
            listeners.slice(1).map(x => this.off(event, x));
        } else {
            // Generalized on change
            listeners.map(x => this.off("change", x));
        }
    };

    onSubmit = (...listeners: Listener<Events<D>, "submit">[]) => {
        listeners.map(x => this.on("submit", x));
    };

    offSubmit = (...listeners: Listener<Events<D>, "submit">[]) => {
        listeners.map(x => this.off("submit", x));
    };

    // TODO: Get rid of these "any" markers once we fix DotPath
    addField: FieldFunc<D, void> = (target: any) => {
        this.fields.add(target);

        if(get(this.initialValues, target, UNDEFINED) !== UNDEFINED) {
            this.valid.add(target);
        }
    };

    removeField: FieldFunc<D, void> = (target: any) => {
        this.fields.delete(target);
        this.valid.delete(target);
    };

    disableField: FieldFunc<D, void> = (field: any) => {
        if(this.disabled.has(field as any)) return;

        this.disabled.add(field as any);
        this.change({ field, forceUpdate: true, disabled: true });
    };

    enableField: FieldFunc<D, void> = (field: any) => {
        if(!this.disabled.has(field as any)) return;

        this.disabled.delete(field);
        this.change({ field, forceUpdate: true, disabled: false });
    };

    disableFields: BulkFieldFunc<D, void> = (...fields) =>
        fields.forEach(field => this.disableField(field));

    enableFields: BulkFieldFunc<D, void> = (...fields) =>
        fields.forEach(field => this.enableField(field));

    setDisabled: BulkFieldFunc<D, void> = (...fields) => {
        let targets = uniq([...this.disabled, ...fields]);
        // TODO: Get rid of these "any" markers once we fix DotPath
        this.disabled = new Set([...fields]) as any;

        targets.forEach(field => this.change({ field }));
    };

    setEnabled: BulkFieldFunc<D, void> = (...fields) => {
        let targets = uniq([...this.disabled, ...fields]);
        this.disabled = filterSet(this.disabled, x => !fields.includes(x));

        targets.forEach(field => this.change({ field }));
    };

    disable = () => {
        let targets = uniq([...this.disabled, ...this.fields]);
        this.disabled = new Set([...this.fields]);
        this.prop("disabled", true);

        targets.forEach(field => this.change({
            field,
            forceUpdate: true,
            disabled: true
        }));
    }

    enable = () => {
        let targets = uniq([...this.disabled, ...this.fields]);
        this.disabled.clear();
        this.prop("disabled", false);

        targets.forEach(field => this.change({
            field,
            forceUpdate: true,
            disabled: false
        }));
    }

    getState = () => ({
        errors: this._errors,
        values: this._values
    });

    //> Can't clone like I used to, because of things like Date objects causing serialization/deserialization issues
    //> Really don't feel like implementing every data type in the traverseDeep algorithm
    values: BulkMutatorFunc<D, D> = ((...fields) => {
        if(fields.length === 0) {
            return { ...this._values };
        }

        if(fields.length === 1 && typeof fields[0] === "object") {
            const values = fields[0] as D;

            return Object.keys(values).map(field => {
                return this.value(field as DotPath<D>, values[field], false)
            });
        }

        return fields.map(x => get(this._values, x));
    }) as BulkMutatorFunc<D, D>;

    errors: BulkMutatorFunc<FormErrors<D>, FormErrors<D>> = ((...fields) => {
        if(fields.length === 0) {
            return { ...this._errors };
        }

        if(fields.length === 1 && typeof fields[0] === "object") {
            return Object.keys(fields[0])
                .map(field => this.error(field as any, fields[0][field]));
        }

        return fields.map(x => get(this._errors, x));
    }) as BulkMutatorFunc<FormErrors<D>, FormErrors<D>>;

    value: MutatorFunc<D> = (...args) => {
        const [ field, value, validate = true ] = args;

        if(args.length <= 1) {
            return get(this._values, field);
        }

        let previousValue = get(this._values, field);
        set(this._values, field, value);

        if(validate) {
            this.validate({ field, cause: "value" }).then(({ skipped }) => !skipped && this.change({ field, previousValue }));
            // this.validate(field, () => this.change({ field, previousValue }));
        } else {
            this.change({ field, previousValue });
        }
    }

    error: ErrorMutatorFunc<FormErrors<D>> = (...args) => {
        const [ field, error, originalField = field ] = args;

        if(args.length <= 1) {
            return get(this._errors, field);
        }

        let exists = propertyExists(this._errors, field);

        if(error && !exists) {
            set(this._errors, field, error);
            this.change({ field: originalField });
        } else if(!error && exists) {
            unset(this._errors, field);
            this.change({ field: originalField });
        }
    }

    // These two should be used only in "./Form" to replace initial values/errors on mount
    replaceValues = (obj: D, initial = false) => {
        this._values = { ...obj };

        if(initial) {
            this.initialValues = { ...obj };
        }
    }

    replaceErrors = (obj: FormErrors<D>, initial = false) => {
        this._errors = { ...obj };

        if(initial) {
            this.initialErrors = { ...obj };
        }
    }

    resetValues = () => this.values({ ...this.initialValues });
    resetErrors = () => this.errors({ ...this.initialErrors });

    resetForm = () => {
        this._values = { ...this.initialValues } as D;
        this._errors = { ...this.initialErrors };
        this.disabled.clear();
        this.valid.clear();
        this.properties = { ...defaultProps, ...this.initialProps };

        this.fields.forEach(field => this.change({
            field: field as DotPath<D>
        }));
    };

    resetFields = (...fields) => {
        for(let field of fields) {
            this.value(field, get(this.initialValues, field));
        }
    }

    setState = (
        values = this._values,
        errors = this._errors,
        disabledFields: string[]
    ) => {
        this._values = { ...values };
        this._errors = { ...errors };

        if(disabledFields) {
            this.disabled = new Set(disabledFields as DotPath<D>[]);
        }

        this.fields.forEach(field => this.change({ field: field as DotPath<D> }));
    }

    change: ChangeFunc<D> = ({
        field,
        callback,
        previousValue,
        forceUpdate = false,
        disabled
    }) => {
        let value = get(this._values, field as string);

        let payload = {
            field,
            value: value,
            previousValue: previousValue !== undefined ? previousValue : value,
            error: get(this._errors, field),
            forceUpdate,
            disabled
        };

        this.emit("change", { ...payload } as any);
        this.emit("update", { errors: this._errors, values: this._values, forceUpdate });
        this.update(payload);

        if(callback) callback(field, payload);
    };

    update = ({ field, previousValue = get(this._values, field) }) => {
        const event = `change-${field}` as keyof Events<D>;
        this.emit(event, {
            value: get(this._values, field),
            previousValue,
            error: get(this._errors, field)
        });
    }

    updateFields = () => {
        this.fields.forEach(field => this.change({
            field: field as DotPath<D>,
            forceUpdate: true
        }));
    }

    hookSubmit = async(e) => {
        e?.preventDefault?.();
        e?.persist?.();

        await this.validate({ cause: "submit", event: e });
    };

    validate = async({ event, field, index, cause = "validate", ...args }: ValidateArgs<D>): Promise<ValidationResult<D>> => {
        if(!field) {
            this.valid.clear();
            let result = await validateForm(this, { cause });
            this.emit("validate", { field, event, index, cause, ...args }, result);

            const { errors, skipped, valid, values } = result;
            this.prop("valid", valid);

            if(valid) {
                this.valid = new Set(this.fields);
            }

            if(result.hasOwnProperty("error")) {
                this.prop("error", result.error);
            }

            if(skipped) return result;

            const canSubmit = !result.error && valid;
            this._errors = {};

            if(errors) {
                this.valid = filterSet(this.fields, x => get(errors, x, UNDEFINED) === UNDEFINED);

                this.replaceErrors(errors);
                this.emit("errors", this._errors);
            }

            this.emit("update", { errors: this._errors, values: values as D, forceUpdate: false });

            if(canSubmit) {
                this.emit("submit", values as any, event);
            }

            this.fields.forEach(field => this.update({ field }));

            return result;
        } else {
            // TODO: Allow individual fields to still validate on blur
            if(!this.validateOnBlur) return { skipped: true };

            let result = await validateForm(this, { cause, field, index });
            this.emit("validate", { field, event, index, cause, ...args }, result);
            const { error, errors, skipped, valid } = result;

            if(valid === false) {
                this.valid.delete(field);
                this.prop("valid", false);
            } else {
                this.valid.add(field);

                if(setsEqual(this.fields, this.valid)) {
                    this.prop("valid", true);
                }
            }

            // this.prop("error", error);

            if(skipped) return result;

            if(errors?.[field as any]) {
                let err;

                if(index !== undefined) {
                    err = errors?.[field as any]?.[index];
                    this.error(`${field}[${index}]` as any, err, field as any);
                } else {
                    err = errors?.[field as any];
                    this.error(field as any, err);
                }

                return result;
            }

            if(index !== undefined) {
                this.error(`${field}[${index}]` as any, null, field as any);
                return result;
            }

            this.error(field as any, null);
            return result;
        }
    }
}
