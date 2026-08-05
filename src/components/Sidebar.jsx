function Sidebar({
  activeSection,
  onNavigate,
  isCollapsed,
  onToggle,
}) {
  const menuItems = [
    { id: "dashboard", icon: "🏠", label: "Dashboard" },
    { id: "products", icon: "📦", label: "Products" },
    { id: "alerts", icon: "⚠️", label: "Stock Alerts" },
    { id: "reports", icon: "📊", label: "Reports" },
    { id: "settings", icon: "⚙️", label: "Settings" },
    { id: "checkout", icon: "🛒", label: "Checkout" },
    { id: "sales", icon: "🧾", label: "Sales History" },
  ];

  return (
    <aside
      className={`sidebar ${
        isCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-logo">DJ</div>

          {!isCollapsed && (
            <div className="brand-text">
              <h2>DAPPY JOSH LTD</h2>
              <p>Inventory System</p>
            </div>
          )}
        </div>

        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggle}
          title={
            isCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {isCollapsed ? "➜" : "⬅"}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${
              activeSection === item.id ? "active" : ""
            }`}
            onClick={() => onNavigate(item.id)}
            title={isCollapsed ? item.label : ""}
          >
            <span className="nav-icon">
              {item.icon}
            </span>

            {!isCollapsed && (
              <span className="nav-label">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="sidebar-footer">
          <p>Powered by</p>
          <strong>Dappy Josh Technologies</strong>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;