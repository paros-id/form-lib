import { useEffect, useState } from "react";
import type ReactForm from "~/ReactForm";
import { FormProps } from "~/types/ReactForm";

function useFormProp<VT = any>(form: ReactForm<any, any, any>, prop: string): VT {
    const [ value, setValue ] = useState(() => form.prop(prop));

    useEffect(() => {
        function callback(k, v) {
            if(k === prop) {
                setValue(v);
            }
        }

        form.on("prop", callback);
        return () => {
            form.off("prop", callback);
        };
    }, []);

    return value;
}

export function useFormProps<T extends string[]>(form: ReactForm<any, any, any>, ...props: [...T]): FormProps<T> {
    const [ value, setValue ] = useState(() => form.props<T>(...props));

    // console.log({ value });

    useEffect(() => {
        function callback(k, v) {
            // console.log("Prop change!", k, v);
            if(props.includes(k)) {
                // The prop event is called for every change, so we only need to update one change at a time
                setValue({ ...value, [k]: v });
            }
        }

        form.on("prop", callback);
        return () => {
            form.off("prop", callback);
        };
    }, []);

    return value;
}

export default useFormProp;
