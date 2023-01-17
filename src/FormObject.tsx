import MetadataContext, { MetadataContextInfo } from "./MetadataContext";

import type { ReactNode } from "react";
import type ReactForm from "./ReactForm";

type Props = {
    field: string;
    form?: ReactForm<any, any, any>;
    children: ReactNode;
};

function FormObject({
    field, form, children
}: Props) {
    return (
        <MetadataContext.Provider value={{ objectProp: field, form } as MetadataContextInfo} children={children} />
    );
}

export default FormObject;
