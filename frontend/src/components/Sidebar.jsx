import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  HomeIcon,
  ChartBarIcon,
  UsersIcon,
  BriefcaseIcon,
  FolderIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ViewColumnsIcon,
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
  ];

  const managerAndSuperAdminItems = [
    {
      label: "Reports",
      to: "/reports",
      icon: ChartBarIcon,
      roles: ["superadmin", "manager"],
    },
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
        className={`fixed top-0 left-0 h-full z-40 ${sidebarWidth} ${sidebarBg} border-r border-green-100 shadow-lg flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo & close button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-green-100">
          <span className="font-serif text-2xl font-bold text-green-800 px-2">
            CWMS
          </span>
          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-6 h-6 text-green-700" />
          </button>
        </div>
        {/* Nav links */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg font-sans text-green-900 hover:bg-green-100 transition
                ${
                  isActive
                    ? "bg-green-200 font-semibold border-l-4 border-green-600"
                    : ""
                }`
              }
              onClick={() => setOpen(false)}
            >
              <item.icon className="w-6 h-6 text-green-700" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        {/* Profile/settings */}
        <div className="mt-auto px-6 py-4 border-t border-green-100 flex items-center gap-3">
          <UserCircleIcon className="w-8 h-8 text-green-700" />
          <div>
            <div className="font-semibold text-green-900">Name</div>
            <NavLink
              to="/settings"
              className="flex items-center gap-1 text-sm text-green-700 hover:underline"
              onClick={() => setOpen(false)}
            >
              <Cog6ToothIcon className="w-4 h-4" />
              Settings
            </NavLink>
          </div>
        </div>
      </aside>

      {!open && (
        <button
          className="fixed left-3 top-5 z-50 bg-green-700 text-white p-1 block lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open sidebar"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
