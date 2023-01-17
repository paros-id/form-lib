import React from "react";

/**
 * Allows components to receive refs, even if they normally wouldn't be able to
 */
function withRef(Component: React.ComponentType) {
    function RefForwardingComponent(props, ref) {
        return (
            <Component {...props} forwardedRef={ref} />
        );
    }

    return React.forwardRef(RefForwardingComponent);
}

export default withRef;
