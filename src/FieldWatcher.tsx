import { useEffect, useMemo } from "react";
import useUpdater from "./hooks/useUpdater";
import useWatchedFieldNames from "./hooks/useWatchedFieldNames";

import ReactForm from "./ReactForm";
import { DotPath } from "./types/AutoPath";
import { FormObject } from "./types/ReactForm";

import { TemplateRegistry } from "./types/templates";
import { FormValidationMethod } from "./types/validators";

export type Props<
    D extends FormObject,
    V extends FormValidationMethod,
    T extends TemplateRegistry
> = {
    field?: string;
    fields?: string[];
    children?: FieldWatcherRenderer<D, V, T> | React.ReactNode;
    component?: React.ElementType;
    [key: string]: any;
};

export type HookedFieldWatcher<
    D extends FormObject,
    V extends FormValidationMethod,
    T extends TemplateRegistry
> = React.FunctionComponent<Props<D, V, T>>;

type FieldWatcherRenderer<
    D extends FormObject,
    V extends FormValidationMethod,
    T extends TemplateRegistry
> = (
    data: any,
    props: any,
    form: ReactForm<D, V, T>,
    field: string
) => any;

export function createFieldWatcherComponent<
    D extends FormObject,
    V extends FormValidationMethod,
    T extends TemplateRegistry
>(form: ReactForm<D, V, T>) {
    return function FieldWatcher({
        field: F,
        fields: FS = [],
        children,
        component: Component,
        ...props
    }: Props<D, V, T>) {
        const [ field, fields ] = useMemo(() => {
            if(!F && FS.length) {
                let [ field ] = FS;
                let fields = FS.slice(1);

                return [ field as string, fields ];
            }

            return [ F as string, FS ];
        }, [ F, ...FS ]);

        const targets = useWatchedFieldNames(field, ...fields) as DotPath<D>[];
        const onUpdate = useUpdater();

        useEffect(() => {
            for(const target of targets) {
                const key = target as DotPath<D>;
                form.addField(key);
                form.onChange(key, onUpdate);
            }

            return () => {
                for(const target of targets) {
                    const key = target as DotPath<D>;
                    form.offChange(key, onUpdate);
                    form.removeField(key);
                }
            };
        }, targets);

        // We don't want to memoize this so it actually updates the child component
        const data = targets.reduce((obj, key) => ({
            ...obj,
            [key]: form.value(key)
        }), {});

        if(Component) {
            return (
                <Component {...data} {...props} form={form} children={children} />
            );
        } else if(typeof children === "function") {
            return children(data, props, form, field) || null;
        }
    }
}