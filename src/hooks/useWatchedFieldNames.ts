import { useContext, useMemo } from "react";
import MetadataContext from "~/MetadataContext";
import { mergeProperties } from "~/utils/properties";

export function useWatchedFieldNames(...targets: (string | null | undefined | false)[]) {
    const { objectProp } = useContext(MetadataContext);

    return useMemo(() => {
        return targets.filter(Boolean).map(x => mergeProperties(objectProp, x));
    }, [ objectProp, ...targets ]);
}

export default useWatchedFieldNames;
