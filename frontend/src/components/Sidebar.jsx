import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import {
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  FolderIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ViewColumnsIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

// Define navigation items with role restrictions
const getNavItems = (userRole) => {
  const baseItems = [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: HomeIcon,
      roles: ["superadmin", "manager", "employee"],
    },
    {
      label: "Notifications",
      to: "/notifications",
      icon: BellIcon,
      roles: ["superadmin", "manager", "employee"],
      showBadge: true,
    },
  ];

  const managerAndSuperAdminItems = [
    {
      label: "Members",
      to: "/members",
      icon: UsersIcon,
      roles: ["superadmin", "manager"],
    },
    {
      label: "Roles",
      to: "/roles",
      icon: BriefcaseIcon,
      roles: ["superadmin", "manager"],
    },
  ];

  const projectsItem = [
    {
      label: "Projects",
      to: "/projects",
      icon: FolderIcon,
      roles: ["superadmin", "manager", "employee"],
    },
  ];

  const employeeItems = [
    {
      label: "My Task Board",
      to: "/kanban",
      icon: ViewColumnsIcon,
      roles: ["employee"],
    },
  ];

  let allItems = [...baseItems];

  // Add role-specific items
  if (userRole === "superadmin" || userRole === "manager") {
    allItems = [...allItems, ...managerAndSuperAdminItems];
  }

  allItems = [...allItems, ...projectsItem];

  if (userRole === "employee") {
    allItems = [...allItems, ...employeeItems];
  }

  return allItems.filter((item) => item.roles.includes(userRole));
};

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const navItems = getNavItems(user?.role || "employee");

  // Sidebar width for expanded/collapsed
  const sidebarWidth = "w-64";
  const sidebarBg = "bg-[#efeee8]";

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 ${sidebarWidth} ${sidebarBg} border-r border-green-200 shadow-lg flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-end px-4 py-4 border-b border-green-200">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-green-100 transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-5 h-5 text-green-700" />
          </button>
        </div>
        {/* Nav links */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-sans text-green-900 hover:bg-green-100 hover:shadow-sm transition-all duration-200
                ${
                  isActive
                    ? "bg-green-200 font-semibold shadow-sm border-l-4 border-green-600"
                    : ""
                }`
              }
              onClick={() => setOpen(false)}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-green-700" />
                <span className="text-sm">{item.label}</span>
              </div>
              {item.showBadge && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        {/* Profile/settings */}
        <div className="mt-auto px-4 py-4 border-t border-green-200">
          <div className="flex items-center gap-3 px-2">
            <UserCircleIcon className="w-8 h-8 text-green-700" />
            <div className="flex-1">
              <div className="font-semibold text-green-900 text-sm truncate">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-green-600 capitalize">
                {user?.role || "Member"}
              </div>
            </div>
          </div>
          <NavLink
            to="/settings"
            className="flex items-center gap-2 mt-3 px-2 py-2 text-sm text-green-700 hover:bg-green-100 rounded-lg transition-colors"
            onClick={() => setOpen(false)}
          >
            <Cog6ToothIcon className="w-4 h-4" />
            Settings
          </NavLink>
        </div>
      </aside>

      {!open && (
        <button
          className="fixed left-3 top-5 z-50 bg-green-700 hover:bg-green-800 text-white p-2 rounded-lg shadow-lg block lg:hidden transition-colors"
          onClick={() => setOpen(true)}
          aria-label="Open sidebar"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
