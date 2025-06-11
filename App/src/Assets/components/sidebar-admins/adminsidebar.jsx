import { ChevronFirst, ChevronLast, MoreVertical, FileText, Bell, Palette, Users, LogOut, Gauge, CircleAlert, CircleUserRound, ShieldUser } from "lucide-react"
import logo from "../../images/Xyma-Logo.png"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { createContext, useContext, useState, useEffect, useMemo } from "react"
import axios from "axios"

const SidebarContext = createContext();

const AdminSidebar = ({ children, onToggle }) => {
  const [expanded, setExpanded] = useState(window.innerWidth >= 1024);
  const [activeItem, setActiveItem] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarNavItems = useMemo(() => [
    { key: "dashboard", path: "/dashboard" },
    { key: "generate-report", path: "/admin/generate-report" },
    { key: "set-alert", path: "/admin/set-alert" },
    { key: "alerts-logs", path: "/admin/alerts-logs" },
    { key: "color-range", path: "/admin/color-range" },
    { key: "user", path: "/admin/user" },
    { key: "values", path: "/admin/values" },
    { key: "settings", path: "/settings" },
  ], []);

  useEffect(() => {
    const currentPath = location.pathname.toLowerCase();
    let newActiveItem = "dashboard"; // Default

    // Sort items by path length (descending) to handle nested paths correctly
    const sortedItems = [...sidebarNavItems].sort((a, b) => b.path.length - a.path.length);

    for (const item of sortedItems) {
      if (currentPath.startsWith(item.path)) {
        newActiveItem = item.key;
        break;
      }
    }
    // Explicitly set for root path or if no other match (already default)
    if (currentPath === "/") {
        newActiveItem = "dashboard";
    }

    setActiveItem(newActiveItem);
    localStorage.setItem('activeSidebarItem', newActiveItem);

    // Add event listener to handle window resizing
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setExpanded(false); // Collapse the sidebar in mobile view
      } else {
        setExpanded(true); // Expand the sidebar in desktop view
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location, sidebarNavItems]);

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setExpanded((curr) => !curr);
      if (onToggle) {
        onToggle(!expanded);
      }
    }
  };

 const handleLogout = async () => {
  try {
  

    const refreshToken = localStorage.getItem("refreshToken");
    const email = localStorage.getItem('email'); 
    // const accessToken = localStorage.getItem('accessToken');

    // Make logout request first
    const response = await axios.delete(
      `${process.env.REACT_APP_SERVER_URL}auth/logout`,
      {
        data: { refreshToken, email },
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // Clear storage only after successful response
    if (response.status === 200) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace(`/`);
    }
  } catch (error) {
    console.error("Logout error:", error);
    localStorage.clear();
    sessionStorage.clear();
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.replace(`/`);
  }
};

    return (
        <>
            <aside className="h-screen">
                <nav className="flex flex-col h-full bg-[rgba(16,16,16,0.9)] border-r shadow-sm">
                    <div className="flex items-center justify-between p-4 pb-2">
                        <img src={logo} className={`overflow-hidden transition-all ${expanded ? "w-32" : "w-0"}`} />
                        <button 
                          onClick={toggleSidebar}
                          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white hidden md:flex"
                        >
                            {expanded ? <ChevronFirst /> : <ChevronLast />}
                        </button>
                    </div>

                    <SidebarContext.Provider value={{ expanded }}>
                        <ul className="flex-1 px-3">
                        <SidebarItem 
                                icon={<Gauge size={20} />} 
                                text="Dashboard" 
                                active={activeItem === "dashboard"} 
                                to="/Dashboard" 
                            />
                            <SidebarItem 
                                icon={<FileText size={20} />} 
                                text="Generate Report" 
                                active={activeItem === "generate-report"} 
                                to="/admin/generate-report" 
                            />
                            <SidebarItem 
                                icon={<Bell size={20} />} 
                                text="Set Alert" 
                                active={activeItem === "set-alert"} 
                                to="/admin/set-alert" 
                            />
                             <SidebarItem 
                                icon={<CircleAlert size={20} />} 
                                text="Alert Logs" 
                                active={activeItem === "alerts-logs"} 
                                to="/admin/alerts-logs" 
                            />
                            <SidebarItem 
                                icon={<Palette size={20} />} 
                                text="Set Color range" 
                                active={activeItem === "color-range"} 
                                to="/admin/color-range" 
                            />
                            <SidebarItem 
                                icon={<Users size={20} />} 
                                text="User" 
                                active={activeItem === "user"} 
                                to="/admin/user" 
                            />
                            {localStorage.getItem('role') === 'superadmin' && (
                            <SidebarItem 
                                icon={<ShieldUser size={20} />} 
                                text="Values" 
                                active={activeItem === "values"} 
                                to="/admin/values" 
                            />
                        )}
                             <SidebarItem 
                                icon={<CircleUserRound size={20} />} 
                                text="Profile" 
                                active={activeItem === "settings"} 
                                to="/Settings" 
                            />
                            <SidebarItem 
                                icon={<LogOut size={20} />} 
                                text="Logout" 
                                active={false} 
                                onClick={handleLogout}
                                className="hover:bg-red-600"
                            />
                        </ul>
                    </SidebarContext.Provider>

                    <div className="flex p-3 text-white border-t">
                    

                        <div className="flex items-center justify-center w-10 h-10 font-semibold text-white bg-blue-600 rounded-md">{localStorage.getItem("email")?.charAt(0).toUpperCase() || "U"}</div>
                        <div className={`flex justify-between items-center overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"} `}>
                            <div className="flex flex-col items-start leading-4">
                                <h4 className="font-semibold ">{localStorage.getItem("role")}</h4>
                                <span className="text-xs text-white">{localStorage.getItem("email")}</span>
                            </div>
                            {/* <MoreVertical size={20} /> */}
                        </div>
                    </div>
                </nav>
            </aside>
        </>
    )
}

export function SidebarItem({ icon, text, active, alert, to, onClick, className = "" }) {
    const { expanded } = useContext(SidebarContext)
    const content = (
        <li className={`relative flex items-center h-12 py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${active ? "bg-gray-700 text-white" : "hover:bg-gray-800 text-white"} ${className}`}>
            <div className="flex items-center w-full">
                {icon}
                <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>{text}</span>
                {alert && (
                    <div className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? "" : "top-2"}`}>
                    </div>
                )}
            </div>

            {!expanded && (
                <div className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-gray-800 text-white text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}>
                    {text}
                </div>
            )}
        </li>
    );

    if (onClick) {
        return (
            <div onClick={onClick} className="block">
                {content}
            </div>
        );
    }

    return (
        <Link to={to} className="block">
            {content}
        </Link>
    );
}

export default AdminSidebar