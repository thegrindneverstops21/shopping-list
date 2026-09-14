import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme(){
    const [theme, setTheme] = useState<Theme>(() => {
        return localStorage.getItem("theme") === "dark" ? "dark" : "light";
    });

    useEffect(() => {
        if(theme === "dark") {
            // Set the data-theme attribute on root element
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            // Remove the data-theme attribute (shows light theme by default)
            document.documentElement.removeAttribute("data-theme");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    function toggleTheme() {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }

    return{theme, toggleTheme};
}