import { useContext, useEffect } from "react";
import MetadataContext from "~/MetadataContext";

export type FormEffectHook<T = {}> = (
    effect: <K extends keyof T>(event: {
        field: keyof T;
        value: T[K];
        previousValue: T[K];
        error?: any;
        form: any;
    }) => any,
    fields: (keyof T)[],
) => void;

/**
 * Will either listen to all form changes, or specific fields, and return the relevant change effect
 */
function useFormEffect<T extends any[]>(
    effect: (event: { field: T[number]; value: any; previousValue: any; error?: any; form: any; }) => any,
    fields: [...T],
    targetForm
) {
    const { form: contextForm } = useContext(MetadataContext);

    const form = targetForm || contextForm;

    useEffect(() => {
        if(!fields.length) {
            function onChange({ field, value, previousValue, error }: any) {
                effect({ field, value, previousValue, error, form });
            }

            form.on("change", onChange);
            return () => {
                form.off("change", onChange);
            };
        }

        const listeners = fields.map(field => {
            function onChange({ value, previousValue, error }) {
                effect({ field, value, previousValue, error, form });
            }

            const event: any = `change-${field}`;
            form.on(event, onChange);
            return [ event, onChange ];
        });

        return () => {
            listeners.forEach(([ event, onChange ]) => form.off(event, onChange));
        };
    }, [ form ]);
}

export default useFormEffect;
