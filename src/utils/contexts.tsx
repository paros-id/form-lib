import React from "react";

type PassthroughHandler<T> = (src: T, val: T) => any;

const DefaultPassthroughHandler = (a, b) => ({ ...a, ...b });

export function createNestingContext<T>(defaultValue: T, calculateChangedBits?, merge: PassthroughHandler<T> = DefaultPassthroughHandler) {
    // @ts-ignore Second argument doesn't exist in docs, but exists in React code
    const CTX = React.createContext<T>(defaultValue, calculateChangedBits);
    const Provider = CTX.Provider;

    //! TODO: Analyze performance hit from nested consumer/provider pairs
    const PropagatingProvider = ({ value, merge: innerMerge = merge, children }) => (
        <CTX.Consumer>
            {passthrough => (
                <Provider value={innerMerge(passthrough, value)}>
                    {children}
                </Provider>
            )}
        </CTX.Consumer>
    );

    CTX.Provider = PropagatingProvider as React.Provider<T>;

    return CTX;
}

export default {
    createNestingContext,
};
