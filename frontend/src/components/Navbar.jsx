import React, { useState } from "react";
import {Search, Bell, UserCircle, AlertCircle, ClipboardList, Home} from "lucide-react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  /* ---------------- ROLE-BASED NAV ITEMS ---------------- */

  const citizenNavItems = [
    { icon: <Home />, label: "Feed", href: "/feed" },
    { icon: <AlertCircle />, label: "Explore", href: "/explore" },
    {
      icon: (
        <div className={styles.reportIcon}>
          <FontAwesomeIcon icon={faSquarePlus} />
        </div>
      ),
      label: "Report",
      href: "/create-issue",
    },
    { icon: <Bell />, label: "Alerts", href: "/alerts" },
  ];

  const adminNavItems = [
    { icon: <ClipboardList />, label: "Issues", href: "/admin" },
    { icon: <AlertCircle />, label: "Explore", href: "/explore" },
    {
      icon: (
        <div className={styles.reportIcon}>
          <FontAwesomeIcon icon={faSquarePlus} />
        </div>
      ),
      label: "Report",
      href: "/create-issue",
    },
    { icon: <Bell />, label: "Alerts", href: "/alerts" },
  ];

  const navItems = user?.isAdmin ? adminNavItems : citizenNavItems;

  /* ---------------- RENDER ---------------- */

  return (
    <>
      {/* DESKTOP NAVBAR */}
      <header className={styles.navbar}>
        <div className={styles.navbarInner}>
          <Link
            to={user?.isAdmin ? "/admin" : "/feed"}
            className={styles.logo}
          >
            Civic Monitor
          </Link>

          <div className={styles.searchContainer}>
            <Search size={16} />
            <input
              className={styles.searchInput}
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.navItems}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`${styles.navItem} ${
                  location.pathname === item.href
                    ? styles.navItemActive
                    : ""
                }`}
              >
                <div className={styles.navItemIcon}>
                  {React.cloneElement(item.icon, {
                    className:
                      location.pathname === item.href
                        ? styles.navIconActive
                        : "",
                  })}
                </div>
                <span>{item.label}</span>
              </Link>
            ))}

            {/* PROFILE */}
            <div className={styles.profileContainer}>
              <button
                className={styles.profileButton}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className={styles.profileAvatar}>
                  {user?.fullName?.[0]?.toUpperCase()}
                </div>
                <span>Profile</span>
              </button>

              {isProfileOpen && (
                <div className={styles.profileDropdown}>
                  <div className={styles.profileHeader}>
                    <strong>{user?.fullName}</strong>
                    <small>{user?.email}</small>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Profile
                  </Link>

                  <button onClick={handleLogout} className={styles.logout}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE NAV */}
      <nav className={styles.mobileNav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`${styles.mobileNavItem} ${
              location.pathname === item.href
                ? styles.mobileNavItemActive
                : ""
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}

        <Link
          to="/profile"
          className={`${styles.mobileNavItem} ${
            location.pathname === "/profile"
              ? styles.mobileNavItemActive
              : ""
          }`}
        >
          <UserCircle />
          <span>Profile</span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
