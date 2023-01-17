import React, { useEffect } from "react";
import useFormProp from "./hooks/useFormProp";

import FormObjectComponent from "./FormObject";
import ReactForm from "./ReactForm";

import { FormErrors, FormObject } from "./types/ReactForm";
import { TemplateRegistry } from "./types/templates";
import { FormValidationMethod } from "./types/validators";
import MetadataContext, { MetadataContextInfo } from "./MetadataContext";

export type Props<D extends FormObject, V, T> = {
    onSubmit?: any;
    initialValues?: Partial<D>;
    initialErrors?: FormErrors<D>;
    onChange?: any;
    onError?: any;
    validation?: any;
    field?: any;
    as?: React.ElementType;
    forwardedRef?: any;
    [key: string]: any;
} & React.FormHTMLAttributes<"form">;

export type HookedFormComponent<
    D extends FormObject,
    V,
    T
> = React.FunctionComponent<Props<D, V, T>>;

export function createFormComponent<
    D extends FormObject,
    V extends FormValidationMethod,
    T extends TemplateRegistry
>(form: ReactForm<D, V, T>) {
    return function HookedForm({
        initialValues,
        initialErrors,
        onSubmit,
        onChange,
        onError,
        validation,

        as: As = "form",
        children,
        field,
        forwardedRef,
        ...props
    }: Props<D, V, T>) {
        const isValid = useFormProp<boolean>(form, "valid");

        useEffect(() => {
            if(onSubmit) form.onSubmit(onSubmit);
            if(onChange) form.onChange(onChange);
            if(onError) form.on("errors", onError);
            if(initialValues) form.replaceValues(initialValues as D, true);
            if(initialErrors) form.replaceErrors(initialErrors, true);
            if(validation) form.validation = validation;

            return () => {
                if(onSubmit) form.offSubmit(onSubmit);
                if(onChange) form.offChange(onChange);
                if(onError) form.off("errors", onError);
            };
        }, []);

        useEffect(() => {
            if(validation) form.validation = validation;
        }, [ validation ]);

        let body = children;

        if(field && field.length) {
            body = (
                <FormObjectComponent field={field} form={form}>{body}</FormObjectComponent>
            );
        }

        return (
            <MetadataContext.Provider value={{ form } as unknown as MetadataContextInfo}>
                <As {...props} ref={forwardedRef} onSubmit={form.hookSubmit} data-valid={Boolean(isValid)}>
                    {body}
                </As>
            </MetadataContext.Provider>
        );
    }
}

