import { Listener } from "~/utils/emitter";
import { DotPath, DotValue } from "../AutoPath";
import { TemplateRegistry } from "../templates";
import { FormValidationMethod, ValidationMethods } from "../validators";
import { Events, EventFunc } from "./events";

export type { Events, EventFunc };

export type ReactFormOpts<
    D extends FormObject,
    V extends FormValidationMethod,
    T extends TemplateRegistry
> = {
    name?: string;

    onSubmit?: Listener<Events<D>, "submit">;
    onChange?: Listener<Events<D>, "change">;
    onError?: Listener<Events<D>, "errors">;
    onUpdate?: Listener<Events<D>, "update">;

    debugUpdates?: boolean;
    debugChanges?: boolean;

    validateOnBlur?: boolean;
    validation?: ValidationMethods<D>[V];
    validationMethod?: V;
    templates?: T;

    initialValues?: Partial<D>;
    initialErrors?: FormErrors<D>;
    initialProps?: { [key: string]: any };
    disabledFields?: DotPath<D>[];
};

export type FormObject = {
    [key: string]: FormObject | any;
};

export type FormErrors<T extends FormObject = {}> = Partial<T>;

export type FieldFunc<D, R> = {
    // (field: DotPath<D>): R;
    (field: string): R;
};

export type BulkFieldFunc<D, R> = {
    // (...fields: DotPath<D>[]): R;
    (...fields: string[]): R;
};

// TODO: Make DotPath less "excessively deep"
export type MutatorFunc<D> = {
    <E extends string>(field: E): any;
    // <E extends string>(field: DotPath<D, E>): DotValue<D, E>;
    // (field: string): any;

    <E extends string>(field: E, value: any, validate?: boolean): void
    // <E extends string>(field: DotPath<D, E>, value: DotValue<D, E>, validate?: boolean): void
    // (field: string, value: any, validate?: boolean): void;
};

// TODO: Make DotPath less "excessively deep"
export type ErrorMutatorFunc<D> = {
    <E extends string>(field: E): any;
    // <E extends string>(field: DotPath<D, E>): DotValue<D, E>;
    // (field: string): any;

    <E extends string>(field: E, value: any, originalField?: string): void
    // <E extends string, F extends DotPath<D>>(field: DotPath<D>, value: DotValue<D, E> | null, originalField?: F): void
    // (field: string, value: any, originalField?: string): void;
};

export type SetStateFunc<D extends FormObject> = {
    (values: D, errors: FormErrors<D>, disabledFields)
}

export type ChangeFunc<D extends FormObject> = {
    <E extends string>(args: ChangeFuncArgs<D, E>): void;
}

export type ChangeFuncArgs<D extends FormObject, E extends string> = {
    field: DotPath<D, E>;
    callback?: any;
    previousValue?: any;
    forceUpdate?: boolean;
    disabled?: boolean;
};

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never
type StrictDotPath<D> = (DotPath<D> & string)[];

//! TODO: AutoPath isn't working right for non-root-level paths (e.g. "x.y")
export type BulkMutatorFunc<D, R> = {
    (): R;
    (values: Partial<D>): void;
    <F extends DotPath<D>[]>(...fields: [...F]): {
        [K in keyof F]: DotValue<D, F[K]>;
    };
}

export type ValidateArgs<D extends FormObject = {}> = {
    field?: DotPath<D>;
    index?: number;
    cause?: string;
    event?: any;
};

export type PropFunc = {
    <T = any>(key: string): T;
    <T>(key: string, value: T): T;
};

export type FormProps<T extends [...string[]]> = { [key in T[number]]: any };

type Dictionary = { [key: string]: any };

export type MultiPropFunc = {
    <T extends Dictionary>(dictionary: T): void;
    <T extends [...string[]]>(...keys: T): FormProps<T>;
};
