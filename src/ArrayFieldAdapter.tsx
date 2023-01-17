import { forwardRef, memo, useMemo } from "react";
import ReactForm from "./ReactForm";
import { ARRAY_INDEX } from "./symbols";
import clone from "./utils/underscore/clone";

type FilterFunc<T extends any[]> = (
    item: T extends (infer U)[] ? U : never,
    index?: number
) => unknown;

export type ArrayFieldAdapterProps<T extends any[]> = {
    children?: React.ReactNode | (() => any);
    value: T;
    keyProp?: string;
    valueProp?: string;
    onChangeProp?: string;
    fieldComponent?: React.ElementType;
    filter?: FilterFunc<T>;
    template?: string;
    form: ReactForm<any, any, any>;
    onBlurProp?: string;
    disabled?: boolean;
    onChange?: any;
};

function ArrayFieldAdapter<T extends any[]>({
    children,
    value = [] as unknown as T,
    keyProp,
    valueProp,
    onChangeProp,
    fieldComponent,
    filter,
    template,
    form,
    onBlurProp,
    disabled,
    onChange
}: ArrayFieldAdapterProps<T>, ref) {
    if(typeof children !== "function" && fieldComponent === undefined)
        throw new Error("Must pass either component property or rendering function in children to ArrayFieldAdapter!");
    if(!keyProp)
        throw new Error("Must pass keyProp to ArrayFieldAdapter!");

    const changeCallback = index => (e, callback) => {
        let val = value;
        val[index] = e;
        val[ARRAY_INDEX] = index;

        return onChange(val, callback);
    };

    let dataset = useMemo(() => {
        return value.filter(filter as any);
    }, [ value, filter ]);

    //! Implement array field adapter properly
    return null;
}

const withRef = forwardRef(ArrayFieldAdapter);
const memoized = memo(withRef);

export default memoized;
