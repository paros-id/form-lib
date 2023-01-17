import { Listener } from "~/utils/emitter";
import { FormErrors, FormObject, ValidateArgs } from ".";
import { DotPath, DotValue } from "../AutoPath";
import { ValidationResult } from "../validators";

//! TODO: FieldChangeEvents is unstable because of DotPath without any params
export type Events<D extends FormObject> = FormEvents<D>;// & FieldChangeEvents<D>;

type FormEvents<D extends FormObject> = {
    "update": [event: UpdateEvent<D>];
    "change": [event: ChangeEvent<D>];
    "errors": [errors: FormErrors<D>];
    "prop": [key: string, value: any];
    "validate": [reason: ValidateArgs<D>, result: ValidationResult<D>];
    "submit": [values: D, event?: any];
    "__change_field": [value: any];
};

// type FieldChangeEvents<D> = {
//     [Key in `change-${DotPath<D>}`]: [ event: FieldChangeEvent<D, Key> ];
// };

export type UpdateEvent<D extends FormObject> = {
    errors: FormErrors<D>;
    values: D;
    forceUpdate: boolean;
}

export type ChangeEvent<D extends FormObject, K = DotPath<D>, VT = DotValue<D, K>> = {
    field: K;
    value: VT;
    previousValue: VT;
    error?: any;
    forceUpdate: boolean;
    disabled?: boolean;
}

export type FieldChangeEvent<D, K> = {
    value: DotValue<D, K>;
    previousValue: DotValue<D, K>;
    error?: any;
};

export type EventFunc<D extends FormObject, Q extends keyof Events<D>, R extends keyof Events<D>> = {
    <E extends DotPath<D>>(field: E, ...listeners: Listener<Events<D>, Q>[]): void;
    (...listeners: Listener<Events<D>, R>[]): void;
};

