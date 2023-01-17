import { useContext, useMemo, useRef } from "react";
import { determineValueGetter, mergeProperties } from "~/utils/properties";

import MetadataContext from "~/MetadataContext";
import ReactForm from "~/ReactForm";

import { BuiltinTransformerRegistry, getTransformer } from "~/templates";
import type { FormValidationMethod } from "~/types/validators";
import type { TemplateOutput, TemplateRegistry } from "~/types/templates";
import useValidationContextualData from "./useValidationContextualData";

import { FormObject } from "~/types/ReactForm";

type HookTemplate = TemplateOutput & {
    componentProps: any;
    ref?: any;
};

function useHookTemplate<
    D extends FormObject,
    V extends FormValidationMethod,
    T extends TemplateRegistry = BuiltinTransformerRegistry
>(
    form: ReactForm<D, V, T>,
    field: string,
    props: any,
    fieldRef?: any,
): HookTemplate {
    const {
        component, template,
        defaultValue,
        forwardedRef = fieldRef,
        componentProps = {},
        name,
        valueGetter = "target.value",
        valueProp = "value",
        errorProp = "error",
        validateOnBlur,
        interceptOnChange = false,
        fieldHiddenWhenDisabled = false,
        validateOnChange = false,
        // These two come from the parent
        onChange, onBlur,
        // These two are passed into the component
        onChangeProp = "onChange", onBlurProp = "onBlur",
        forbidNull,
        // Everything else goes into the component
        ...passthrough
    } = props;

    const metadata = useContext(MetadataContext);

    const computedProps = useMemo(() => ({
        target: mergeProperties(metadata.objectProp, field),
        valueGetter: determineValueGetter(valueGetter),
    }), [ field, metadata.objectProp, valueGetter ]);

    const contextualProps = useValidationContextualData(form, computedProps.target);

    const transformer = useMemo(() => form.templates?.getTransformer(template) || getTransformer(template), [ template ]);
    const transformed = useRef<TemplateOutput>({
        ...computedProps,
        component,
        name: field,
        defaultValue,
        valueProp, errorProp, onChangeProp, onBlurProp,
        onChange, onBlur,
        validateOnBlur,
        props: {},
        hideWhenDisabled: fieldHiddenWhenDisabled,
        interceptOnChange,
        validateOnChange,
        forbidNull
    });

    // Compute before return
    useMemo(() => {
        transformed.current = {
            ...transformed.current,
            ...computedProps,
        };

        transformer.transform({
            field,
            props,
            context: metadata,
            output: transformed.current
        });
    }, [ transformer, field, template, metadata.objectProp ]);

    transformer.intercept({
        field,
        props,
        context: metadata,
        output: transformed.current
    });

    return {
        ...transformed.current,
        componentProps,
        ref: forwardedRef,
        props: {
            ...contextualProps,
            ...passthrough,
            ...transformed.current.props
        }
    };
}

export default useHookTemplate;
