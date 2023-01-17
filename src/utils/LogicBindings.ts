import { useMemo } from "react";
import { ARRAY_INDEX } from "~/symbols";
import { determineValueGetter } from "./properties";

import { ValidationResult } from "~/types/validators";
import { FormObject } from "~/types/ReactForm";

export interface LogicAdapter<T extends FormObject> {
    getError(field: string): any;
    getValue(field: string): any;
    setError(field: string, error: any, update: boolean): any;
    setValue(data: any): any;
    delError(field: string): any;
    delValue(field: string): any;
    hasValue(field: string): boolean;
    isDisabled(field: string): boolean;

    validateOnBlur(): boolean;
    validate(options: any): Promise<ValidationResult<T>>;
}

export default class LogicBindings<T extends FormObject> {
    private context: LogicAdapter<T>;

    getError = field => this.context.getError(field);
    getValue = field => this.context.getValue(field);

    setError = (field, error, update?) => this.context.setError(field, error, update);
    setValue = (data) => this.context.setValue(data);

    delError = field => this.context.delError(field);
    delValue = field => this.context.delValue(field);

    hasValue = field => this.context.hasValue(field);
    isDisabled = field => this.context.isDisabled(field);

    constructor(context: LogicAdapter<T>) {
        this.context = context;
    }

    createOnChange = ({ field, valueGetter, interceptOnChange, validateOnChange, handler }) => (e, cb) => {
        let oldError = this.getError(field);
        let value = valueGetter(e, field);

        if(oldError) {
            if(value && value[ARRAY_INDEX]) { // supplied by ArrayFieldAdapter
                this.delError([field, value[ARRAY_INDEX]]);
            } else {
                this.delError(field);
            }
        }

        if(interceptOnChange && handler) {
            let previousValue = this.getValue(field);

            // We allow some fields to intercept onChange so they can perform additional actions before setting state.
            // For example, showing a popup before resetting a form when changing a critical field
            handler({ field, previous: previousValue, value }, (val = value, callback) => {
                this.setValue({ field, previousValue, value: val, callback, update: true });
            });
        } else {
            let previousValue = this.getValue(field);

            this.setValue({
                field,
                value,
                previousValue,
                update: true,
                callback: (field, value) => {
                    if(handler) {
                        return handler(value, field, cb);
                    } else if(typeof cb === "function") {
                        return cb(value, field);
                    }
                }
            });
        }

        if(validateOnChange) {
            // TODO: No async onChange, is this an issue?
            // TODO: Support `index` for ArrayFieldAdapter
            this.context.validate({ field, cause: "change" });
        }
    }

    createOnBlur = (opts: OnBlurOpts = {}) => async(e, metadata = {}) => {
        let { field, validateOnBlur, handler = () => null } = opts;
        let localOverride = opts.hasOwnProperty("validateOnBlur") && opts.validateOnBlur !== undefined;
        const shouldValidate = localOverride ? validateOnBlur : this.context.validateOnBlur();

        const index = metadata[ARRAY_INDEX];

        if(!shouldValidate) return handler(e);

        // TODO: Implement form-level error and valid
        const { skipped, valid, error, errors, values } = await this.context.validate({ field, index, cause: "blur" });
        return handler(e);
    }

    hookField = ({
        // name,
        forbidNull,
        defaultValue = "",
        validateOnBlur,
        value,
        valueGetter = "target.value",
        valueProp = "value",
        errorProp = "error",
        onChangeProp = "onChange",
        onBlurProp = "onBlur",
        onChange,
        onBlur,
        target,
        props = {},
        interceptOnChange,
        hideWhenDisabled,
        validateOnChange,

        createOnChange = this.createOnChange,
        createOnBlur = this.createOnBlur
    }: HookFieldOpts) => {
        const valGetter = useMemo(() => determineValueGetter(valueGetter), [ valueGetter ]);

        if(!this.hasValue(target) || (forbidNull && this.getValue(target) === null))
            this.setValue({ field: target, value: defaultValue });

        if(value !== undefined)
            this.setValue({ field: target, value });

        let disabled = props.disabled;
        let tooltip = props.tooltip;
        let hidden = props.hidden;

        if(this.isDisabled(target)) {
            disabled = true;
            tooltip = props.disabledTooltip;
        }

        if(hideWhenDisabled && disabled) {
            hidden = true;
        }

        return {
            [valueProp]: this.getValue(target),
            [errorProp]: this.getError(target),
            [onChangeProp]: createOnChange({
                field: target,
                valueGetter: valGetter,
                interceptOnChange,
                validateOnChange,
                handler: onChange
            }),
            [onBlurProp]: createOnBlur({
                field: target,
                validateOnBlur: validateOnBlur,
                handler: onBlur
            }),
            id: target,
            name: target,
            ...props,
            disabled,
            tooltip,
            hidden
        };
    };

    getLooseProps = ({
        forbidNull,
        defaultValue = "",
        value,
        valueProp = "value",
        errorProp = "error",
        onChangeProp = "onChange",
        onBlurProp = "onBlur",
        onChange,
        onBlur,
        target,
        props = {},
        hideWhenDisabled
    }: LoosePropsOpts) => {
        let _val = value;

        if(forbidNull && _val === null)
            _val = defaultValue;

        let disabled = props.disabled;
        let tooltip = props.tooltip;
        let hidden;

        if(hideWhenDisabled && disabled) {
            hidden = true;
        }

        return {
            [valueProp]: value,
            [errorProp]: props.error,
            [onChangeProp]: onChange,
            [onBlurProp]: onBlur,
            ...props,
            id: target,
            name: target,
            disabled,
            tooltip,
            hidden
        };
    }
}

export type HookFieldOpts = {
    // name,
    forbidNull?: boolean;
    defaultValue?: any;
    validateOnBlur?: boolean;
    value?: any;
    valueGetter?: string | (() => string);
    valueProp?: string;
    errorProp?: string;
    onChangeProp?: string;
    onBlurProp?: string;
    onChange?: any;
    onBlur?: any;
    target?: any;
    props?: any;
    validateOnChange?: boolean; // Useful for checkboxes, selects, etc.
    interceptOnChange?: boolean;
    hideWhenDisabled?: boolean;
    createOnChange?: any;
    createOnBlur?: any;
};

export type LoosePropsOpts = {
    forbidNull?: boolean;
    defaultValue?: any;
    value?: any;
    valueProp?: string;
    errorProp?: string;
    onChangeProp?: string;
    onBlurProp?: string;
    onChange?: any;
    onBlur?: any;
    target?: any;
    props?: any;
    hideWhenDisabled?: boolean;
};

export type OnBlurOpts = {
    field?: string;
    validateOnBlur?: boolean;
    handler?: any;
};
