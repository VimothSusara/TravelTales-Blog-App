import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

const useScrollRestore = (selector: string) => {
    const location = useLocation();
    const previousPathRef = useRef(location.pathname);

    // Restore scroll on mount or path change
    useEffect(() => {
        const container = document.querySelector(selector);
        const savedPosition = sessionStorage.getItem(location.pathname);

        if (container && savedPosition) {
            container.scrollTop = Number(savedPosition);
        } else if (container) {
            container.scrollTop = 0;
        }
    }, [location.pathname, selector]);

    // Save scroll before unmount or route change
    useEffect(() => {
        return () => {
            const container = document.querySelector(selector);
            if (container) {
                console.log(container.scrollTop)
                sessionStorage.setItem(previousPathRef.current, String(container.scrollTop));
            }
        };
    }, [selector]);

    // Keep ref in sync
    useEffect(() => {
        previousPathRef.current = location.pathname;
    }, [location.pathname]);
}

export default useScrollRestore