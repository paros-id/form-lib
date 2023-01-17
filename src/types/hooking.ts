import React from "react"

export type FieldTemplate = {
    name: string;
    defaultValue?: any;
    valueGetter: any;
    valueProp?: string;
    errorProp?: string;
    onChangeProp?: string;
    onBlurProp?: string;
    onChange?: any;
    onBlur?: any;
    validateOnBlur?: any;
    target: string;
    props: any;
    hideWhenDisabled?: boolean;
    interceptOnChange?: boolean;
    forbidNull?: boolean;
};

export type HookTemplate = {
    Component: React.ElementType;
    ref?: React.Ref<any>;
    props: any;
    template: FieldTemplate;
};