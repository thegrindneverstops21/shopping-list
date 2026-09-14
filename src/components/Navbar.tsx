import { ListCheck, Search, Settings, ShoppingCart, User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get("q") ?? "";

    function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSearchParams((prev) => {
            // If user typed something, add it to URL
            if(e.target.value){
                prev.set("q", e.target.value);
            // If user cleared the input, remove from URL
            } else {
                prev.delete("q");
            }
            return prev;
        });
    }

    return(
        <header className="navbar">
            {/* Home button: Logo in top left */}
            <button className="navbar-logo" onClick={() => navigate("/")} aria-label="Home" title="Home">
                <ShoppingCart size={28} />
            </button>

            {/* Search section: Input with search icon */}
            <div className="navbar-search">
                <Search size={16} className="navbar-search-icon" />
                <input 
                    type="text"
                    value={q}
                    // Search updates URL when user types
                    onChange={onSearchChange}
                    placeholder="search for lists, items"
                    aria-label="Search lists"
                />
            </div>

            {/* Navigation buttons: Top right corner */}
            <nav className="navbar-actions">
                {/* Lists button */}
                <button onClick={() => navigate("/")} aria-label="My lists" title="My lists">
                    <ListCheck size={22} />
                </button>
                
                {/* Profile button */}
                <button onClick={() => navigate("/profile")} aria-label="Profile" title="Profile">
                    <User size={22} />
                </button>

                {/* Settings button (also goes to profile) */}
                <button onClick={() => navigate("/profile")} aria-label="Settings" title="Settings">
                    <Settings size={22} />
                </button>
            </nav>
        </header>
    )
}