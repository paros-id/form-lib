import { useRef } from "react";

function useWrappedRef<D>(initialValue?: D) {
    const ref = useRef(initialValue);

    return [
        ref,
        () => ref.current,
        val => ref.current = val
    ];
}

export default useWrappedRef;
