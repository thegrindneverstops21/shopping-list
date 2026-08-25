import { ListCheck, Search, Settings, ShoppingCart, User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get("q") ?? "";

    function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSearchParams((prev) => {
            if(e.target.value){
                prev.set("q", e.target.value);
            } else {
                prev.delete("q");
            }
            return prev;
        });
    }

    return(
        <header className="navbar">
            <button className="navbar-logo" onClick={() => navigate("/")} aria-label="Home">
                <ShoppingCart size={28} />
            </button>

            <div className="navbar-search">
                <Search size={16} className="navbar-search-icon" />
                <input 
                    type="text"
                    value={q}
                    onChange={onSearchChange}
                    placeholder="search for lists, items"
                    aria-label="Search lists"
                />
            </div>

            <nav className="navbar-actions">
                <button onClick={() => navigate("/")} aria-label="My lists">
                    <ListCheck size={22} />
                </button>
                
                <button onClick={() => navigate("/profile")} aria-label="Profile">
                    <User size={22} />
                </button>

                <button onClick={() => navigate("/profile")} aria-label="Settings">
                    <Settings size={22} />
                </button>
            </nav>
        </header>
    )
}