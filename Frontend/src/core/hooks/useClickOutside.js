import { useEffect } from "react";

/**
 * Hook that alerts clicks outside of the passed ref
 */
export const useClickOutside = (ref, handler, ignoreRefs = []) => {
    useEffect(() => {
        const listener = (event) => {
            // Do nothing if clicking ref's element or descendent elements
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }

            // Do nothing if clicking any of the ignored refs
            for (const ignoreRef of ignoreRefs) {
                if (ignoreRef.current && ignoreRef.current.contains(event.target)) {
                    return;
                }
            }

            handler(event);
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler, ignoreRefs]);
};
