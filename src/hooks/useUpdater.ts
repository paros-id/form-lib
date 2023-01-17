import { useState } from "react";

function useUpdater() {
    let [ timestamp, setTimestamp ] = useState(() => +new Date());

    return function update() {
        setTimestamp(+new Date());
    };
}

export default useUpdater;
