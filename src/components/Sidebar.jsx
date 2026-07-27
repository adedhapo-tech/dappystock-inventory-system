function Sidebar({ activeSection, onNavigate }) {
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
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">DJ</div>

        <div>
          <h2>DAPPY JOSH LTD</h2>
          <p>Inventory System</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${
              activeSection === item.id ? "active" : ""
            }`}
            onClick={() => onNavigate(item.id)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Powered by</p>
        <strong>Dappy Josh Technologies</strong>
      </div>
    </aside>
  );
}

export default Sidebar;