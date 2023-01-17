import { IS_ARRAY_ADAPTER } from "~/symbols";
import ArrayFieldAdapter from "~/ArrayFieldAdapter";

import type {
    TemplateDefinition,
    TemplateTweaker,
    TemplateDesignerOpts,
    TemplateDefinitionFunc,
    TemplateRegistry
} from "~/types/templates";

export class Transformer<K extends string> implements TemplateDefinition<K> {
    name: K;

    constructor(name: K) {
        this.name = name;
    }

    transform(template: TemplateDesignerOpts): TemplateDesignerOpts | void {}
    intercept(template: TemplateDesignerOpts): TemplateDesignerOpts | void {}

    static create<K extends string>(template: TemplateDefinition<K>) {
        return new ConstructedTransformer<K>(template.name, template.transform, template.intercept);
    }
}

// Used for debugging purposes
const builtin = Symbol("builtin");

// Builtin transformers
class BuiltinTransformer<K extends string> extends Transformer<K> {
    readonly tweaker: TemplateTweaker;
    readonly [builtin] = true;

    constructor(name: K, tweaker: TemplateTweaker) {
        super(name);
        this.tweaker = tweaker;
    }

    transform(template: TemplateDesignerOpts) {
        return this.tweaker(template);
    }
}

class ConstructedTransformer<K extends string> extends Transformer<K> {
    readonly transformer: TemplateTweaker;
    readonly interceptor: TemplateTweaker;

    constructor(name: K, transformer: TemplateTweaker, interceptor: TemplateTweaker) {
        super(name);
        this.transformer = transformer;
        this.interceptor = interceptor;
    }

    transform(template: TemplateDesignerOpts) {
        return this.transformer(template);
    }

    intercept(template: TemplateDesignerOpts) {
        return this.interceptor(template);
    }
}

const defaultTransformerName = Symbol("[default]");
class DefaultTransformer extends Transformer<"[default]"> {
    readonly [builtin] = true;
    readonly isDefault = true;

    constructor() {
        super(defaultTransformerName as any);
    }
}

export type BuiltinTransformers = {
    [template in BuiltinTemplates]: BuiltinTransformer<template>;
};

export type Transformers<K extends string> = {
    [template in K]: Transformer<K>;
};

export type BuiltinTransformerRegistry = TemplateRegistry<BuiltinTemplates>;

export function registerTransformers<K extends string>(...transformers: Transformer<K>[]) {
    for(let transformer of transformers) {
        _transformers[transformer.name as string] = transformer;
    }
}

const defaultTransformer = new DefaultTransformer();
export function getTransformer<K extends string>(name: K): Transformer<K> | DefaultTransformer {
    return _transformers[name as string] || defaultTransformer;
}

// Export the builtin transformer keys for default typing purposes
export type BuiltinTemplates = "component" | "text" | "textarea" | "checkbox" | "array";

export const createTransformers: TemplateDefinitionFunc = (...args) => {
    let registry: any = {};
    let holder: any = {};

    if(!(args[0] instanceof Transformer)) {
        holder = args.shift();
        registry = holder.registry;
    }

    registry = args.reduce((registry, transformer) => ({
        ...registry,
        [transformer.name]: transformer
    }), registry);

    const getTransformer = (name) =>  registry[name] || defaultTransformer;

    holder.registry = registry;
    holder.getTransformer = getTransformer;

    return holder;
};

export const _transformers = createTransformers(
    // The most basic field type, a component that directly returns a value
    new BuiltinTransformer("component", ({ output }) => {
        output.valueGetter = v => v;
    }),
    // Really simple textbox
    new BuiltinTransformer("text", ({ output }) => {
        if(!output.component) {
            output.component = "input";
        }

        output.props.type = "text";
        output.forbidNull = true;
    }),
    // Really simple multiline textbox
    new BuiltinTransformer("textarea", ({ output }) => {
        if(!output.component) {
            output.component = "textarea";
        }

        output.forbidNull = true;
    }),
    // Really simple checkbox
    new BuiltinTransformer("checkbox", ({ output }) => {
        if(!output.component) {
            output.component = "input";
        }

        output.validateOnChange = true;
        output.valueGetter = "target.checked";
        output.valueProp = "checked";
        output.props.type = "checkbox";
        output.defaultValue = false;
        output.forbidNull = true;
    }),
    // react-select integration, copy it to your project and register it for an easy integration
    // new BuiltinTransformer("select", ({ output, template, props, templateProps }) => {
    //     if(!output.Component) {
    //         output.Component = ReactSelectComponent;
    //     }

    //     templateProps.isDisabled = props.disabled || props.isDisabled; //Standardize `disabled` prop for all input types
    //     template.defaultValue = null;
    //     template.valueGetter = v => v;
    // }),
    // ArrayFieldAdapter integration for modifying arrays of data
    new BuiltinTransformer("array", ({ field, output, props }) => {
        const Component = props.component;
        output.component = ArrayFieldAdapter;

        // TODO: For some reason, this is the only way we can properly set static properties on the ArrayFieldAdapter component.
        output.component[IS_ARRAY_ADAPTER] = true;

        output.props.field = field;
        output.props.fieldComponent = Component;
        output.valueGetter = props.valueGetter || "target.value";
        output.valueProp = props.valueProp || "value";
        output.onChangeProp = props.onChangeProp || "onChange";

        // TODO: Now that we don't call the transformer every update, how do we pass componentProps like this?
        // Likely the interceptor function
        // output.props.fieldProps = props.componentProps;

        output.defaultValue = [];
        output.valueProp = "value";
        output.onChangeProp = "onChange";
        output.valueGetter = v => v;

        //TODO: Support templates in ArrayFieldAdapter children
    })
);
