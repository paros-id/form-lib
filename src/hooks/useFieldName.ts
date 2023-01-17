import { useContext, useMemo } from "react";
import MetadataContext from "~/MetadataContext";
import { mergeProperties } from "~/utils/properties";

export function useFieldName(field: string) {
    const { objectProp } = useContext(MetadataContext);
    return useMemo(() => mergeProperties(objectProp, field), [ objectProp, field ]);
}

export default useFieldName;
