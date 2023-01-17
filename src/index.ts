export { default as ReactForm } from "./ReactForm";
export { default as FormObject } from "./FormObject";
export { default as MetadataContext } from "./MetadataContext";

export { default as useForm } from "./hooks/useForm";
export { default as useFieldName } from "./hooks/useFieldName";
export { default as useUpdater } from "./hooks/useUpdater";
export { default as useWatchedFieldNames } from "./hooks/useWatchedFieldNames";
export { default as useFormEffect } from "./hooks/useFormEffect";

export { default as withRef } from "./hoc/withRef";

export * as Templates from "./templates";

export type {
    HookedFormComponent,
    Props as FormProps
} from "./Form";

export type {
    HookedFieldWatcher,
    Props as FieldWatcherProps
} from "./FieldWatcher";

export type {
    ArrayFieldAdapterProps
} from "./ArrayFieldAdapter";

export type {
    FormFieldComponent,
    Props as FieldProps
} from "./FormFields/Field";

export type {
    FieldTemplate,
    HookTemplate
} from "./types/hooking";

export type {
    DotPath,
    DotValue
} from "./types/AutoPath";

export type {
    BulkFieldFunc,
    BulkMutatorFunc,
    ChangeFunc,
    ChangeFuncArgs,
    ErrorMutatorFunc,
    EventFunc,
    Events as FormEvents,
    FieldFunc,
    FormErrors,
    FormObject as FormDataObject,
    MutatorFunc,
    ReactFormOpts,
    SetStateFunc,
    ValidateArgs
} from "./types/ReactForm";

export type {
    ChangeEvent,
    FieldChangeEvent,
    UpdateEvent
} from "./types/ReactForm/events";

export type {
    Emitter,
    Listener
} from "./utils/emitter";

export { default as default } from "./ReactForm";
