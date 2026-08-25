import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode}) {
    return(
        <div className="app-layout">
            
            <main className="main-content">{children}</main>
        </div>
    )
}