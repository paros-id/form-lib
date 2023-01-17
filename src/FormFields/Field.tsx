import React, { useEffect, useRef, useState } from "react";
import isEqual from "~/utils/underscore/isEqual";

import useFieldName from "~/hooks/useFieldName";
import useHookTemplate from "~/hooks/useHookTemplate";
import useUpdater from "~/hooks/useUpdater";

import ReactForm from "~/ReactForm";

import { IS_ARRAY_ADAPTER } from "~/symbols";

import type { TemplateKeys, TemplateRegistry } from "~/types/templates";
import type { FormValidationMethod } from "~/types/validators";
import type { BuiltinTransformerRegistry } from "~/templates";
import type { DotPath } from "~/types/AutoPath";
import type { FormFields } from ".";
import { FormObject } from "~/types/ReactForm";

type Map = { [key: string]: any };
type ArrayOrMap = string[] | Map;

type CommonProps = {
    monitors?: ArrayOrMap;
    fieldRequires?: ArrayOrMap;
    fieldExcludedBy?: ArrayOrMap;
    [key: string]: any;
};

export type Props<T extends React.ElementType, U extends TemplateRegistry> =
    | ({ component: T; template?: never; } & React.ComponentPropsWithoutRef<T>)
    | ({ template: TemplateKeys<U>; component?: never; [key: string]: any; });

// export type Props<T extends React.ElementType> = T extends infer U
// ? U extends undefined
//     ? (CommonProps & React.ComponentPropsWithRef<"input">)
//     : U extends React.ElementType
//         ? ({ as?: U } & CommonProps & React.ComponentPropsWithRef<U>)
//         : never
// : never;

export type FormFieldComponent<
    D, V extends FormValidationMethod,
    T extends TemplateRegistry = BuiltinTransformerRegistry
> = {
    <U extends React.ElementType>(props: Props<U, T>, ref?: any): any;
};

export function createField<
    D extends FormObject,
    V extends FormValidationMethod,
    T extends TemplateRegistry = BuiltinTransformerRegistry
>(
    fieldManager: FormFields<D, V, T>,
    form: ReactForm<D, V, T>,
    fieldName: string
) {
    function FormField<U extends React.ElementType>({
        monitors: mons,
        fieldRequires,
        fieldExcludedBy,
        ...passthrough
    }: Props<U, T> & CommonProps, fieldRef) {
        const [ state, setState ] = useState(() => getEmptyProps(mons, fieldName));
        const monitors = useRef<Map>() as Map;
        const requires = useRef<Map>() as Map;
        const excludedBy = useRef<Map>() as Map;

        if(!monitors.current) {
            monitors.current = { ...(mons || {}) };
        }

        if(!requires.current) {
            requires.current = getEmptyProps(fieldRequires, fieldName);
        }

        if(!excludedBy.current) {
            excludedBy.current = getEmptyProps(fieldExcludedBy, fieldName);
        }

        const key = useFieldName(fieldName) as DotPath<D>;
        const onUpdate = useUpdater();

        const { component: Component, ref, props, ...template } = useHookTemplate(form, fieldName, passthrough, fieldRef);
        let { hidden, ...hook } = form.hookField(template);

        const createMonitor = field => {
            let mapping = monitors.current[field];
            let func = typeof mapping === "function" ? mapping : val => ({ [mapping]: val });

            let handler = ({ value }) => {
                let obj = func(value);
                setState(obj);
            };

            monitors.current[field] = handler;
            form.onChange(field, handler);
        };

        const requireValueFor = (field, invert = false, target = requires) => {
            let handler = ({ value, previousValue, forceUpdate }) => {
                if(isEqual(value, previousValue) && !forceUpdate) return;

                // @ts-expect-error Bitwise on booleans works in JS
                if(!!value ^ invert) { //XOR
                    form.enableField(fieldName as any);
                } else {
                    form.disableField(fieldName as any);
                }
            };

            target.current[field] = handler;
            form.onChange(field, handler);

            if(!form.value(field)) {
                form.disableField(fieldName as any);
            }
        };

        useEffect(() => {
            form.addField(key);
            form.onChange(key, onUpdate);

            if(typeof monitors.current === "object") {
                Object.keys(monitors.current).forEach(field => createMonitor(field));
            } else if(Array.isArray(monitors.current)) {
                let mons = [...monitors.current];
                monitors.current = {};
                mons.map(field => createMonitor(field));
            } else if(typeof monitors.current === "string") {
                let monitor = monitors.current;
                monitors.current = {};
                createMonitor(monitor);
            }

            Object.keys(requires.current).forEach(field => requireValueFor(field));
            Object.keys(excludedBy.current).forEach(field => requireValueFor(field, true, excludedBy));

            return () => {
                Object.keys(excludedBy.current).forEach(field => {
                    form.offChange(field as DotPath<D>, excludedBy.current[field]);
                    delete excludedBy.current[field];
                });

                Object.keys(requires.current).forEach(field => {
                    form.offChange(field as DotPath<D>, requires.current[field]);
                    delete requires.current[field];
                });

                Object.keys(monitors.current).forEach(field => {
                    form.offChange(field as DotPath<D>, monitors.current[field]);
                    delete monitors.current[field];
                });

                form.offChange(key, onUpdate);
                form.removeField(key);
            }
        }, []);

        if(hidden || !Component) {
            return null;
        }

        if(Component[IS_ARRAY_ADAPTER]) {
            return (
                <Component {...hook} {...props} {...state}
                    template={template}
                    hook={hook}
                    ref={ref}
                    form={form}
                    monitors={monitors.current} />
            );
        }

        return (
            <Component {...hook} {...props} {...state} ref={ref} />
        );
    }

    const withRef = React.forwardRef(FormField);
    const memoized = React.memo(withRef);
    return memoized;
}

const getFieldArray = fields =>
    (Array.isArray(fields) ? fields : [fields]).filter(x => x && x.length);

const getEmptyProps = (obj = {}, prop) => {
    if(Array.isArray(obj)) {
        let arr = getFieldArray(obj);
        return arr.reduce((obj, field) => ({ ...obj, [field]: null }), {});
    } else if(typeof obj === "object") {
        return Object.keys(obj).reduce((obj, field) => ({ ...obj, [field]: null }), {});
    } else return getEmptyProps([obj], prop);
};

export default createField;
