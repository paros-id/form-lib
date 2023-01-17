import React from "react";
import { MetadataContextInfo } from "~/MetadataContext";

export type TemplateOutput = {
    component?: React.ElementType;
    name: string;
    props: any;
    defaultValue?: any;
    valueGetter: string | ((...args: any[]) => any);
    valueProp: string;
    errorProp: string;
    onChangeProp: string;
    onBlurProp: string;
    onChange: any;
    onBlur: any;
    validateOnChange: boolean;
    validateOnBlur: boolean;
    target: string;
    hideWhenDisabled: boolean;
    interceptOnChange: boolean;
    forbidNull: boolean;
};

export type TemplateDesignerOpts = {
    field: string;
    props: any;
    context: MetadataContextInfo;
    output: TemplateOutput;
};

export interface TemplateDefinition<T extends string> {
    name: T;

    transform(template: TemplateDesignerOpts): TemplateDesignerOpts | void;
    intercept(template: TemplateDesignerOpts): TemplateDesignerOpts | void;
}

export type TemplateTweaker = (template: TemplateDesignerOpts) => void;

export type DefinedTemplates<K extends string = string> = {
    [name in K]: TemplateDefinition<K>
};

export type TemplateRegistry<K extends string = string> = {
    registry: DefinedTemplates<K>;
    getTransformer(name: K): TemplateDefinition<K>
};

export type TemplateKeys<T extends TemplateRegistry<any>> = T extends TemplateRegistry<infer U>
    ? U
    : never;

export type MergedRegistry<
    A extends TemplateRegistry<any>,
    B extends TemplateRegistry<any>
> = A extends TemplateRegistry<infer T>
        ? B extends TemplateRegistry<infer U>
            ? TemplateRegistry<T | U>
            : never
        : never;

export type MergedRegistries<
    A extends TemplateRegistry<any>,
    B extends TemplateDefinition<any>[]
> = A extends TemplateRegistry<infer T>
        ? B extends TemplateDefinition<infer U>[]
            ? TemplateRegistry<T | U>
            : never
        : never;

export type TemplateDefinitionFunc = {
    <K extends TemplateDefinition<any>[]>(...templates: [...K]):
        K extends TemplateDefinition<infer T>[]
            ? TemplateRegistry<T>
            : never;

    <O extends TemplateRegistry<any>, K extends TemplateDefinition<any>[]>(
        definitions: O,
        ...templates: [...K]
    ): MergedRegistries<O, K>;
};
