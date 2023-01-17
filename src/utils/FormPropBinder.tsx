import { cloneElement, ReactElement, ReactNode, useMemo } from "react";
import useFormProp, { useFormProps } from "~/hooks/useFormProp";
import { FormObject } from "~/types/ReactForm";
import { TemplateRegistry } from "~/types/templates";
import { FormValidationMethod } from "~/types/validators";

import { ReactForm } from "..";

export type FormPropBinder = {
    (map: { [prop: string]: string }, element: ReactElement): ReactElement;
}

type Props = {
    map: { [prop: string]: string };
    element: ReactElement;
};

function createFormPropBinder<
    D extends FormObject,
    V extends FormValidationMethod,
    T extends TemplateRegistry
>(form: ReactForm<D, V, T>): FormPropBinder {
    function BoundComponent({
        map, element
    }: Props) {
        const [ keys, mapping ] = useMemo(() => {
            const keys: string[] = [];
            // { key: [ prop, inverted ] }
            const mapping = Object.entries(map).reduce((dict, [p, v]) => {
                if(v.startsWith("!")) {
                    const k = v.substring(1);
                    keys.push(k);

                    return {
                        ...dict,
                        [v.substring(1)]: [ p, true ]
                    };
                }

                keys.push(v);

                return {
                    ...dict,
                    [v]: [ p, false ]
                };
            }, {});

            return [ keys, mapping ];
        }, []);

        let values = useFormProps(form, ...keys);
        const props = useMemo(() => keys.reduce((props, key) => {
            const [ prop, inverted ] = mapping[key];

            return {
                ...props,
                [prop]: inverted ? !values[key] : values[key]
            };
        }, {}), [ values ]);

        // console.log({ mapping, keys, values, props });

        return cloneElement(element, props);
    }

    return function FormPropBinder(map, elem) {
        return <BoundComponent map={map} element={elem} />
    }
}

export default createFormPropBinder;
