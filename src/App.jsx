import { useEffect, useMemo, useState } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import SummaryCards from "./components/SummaryCards";
import InventoryChart from "./components/InventoryChart";
import InventoryInsights from "./components/InventoryInsights";

const API_URL = "https://dappystock-api.onrender.com";
function App() {
  const [activeSection, setActiveSection] =
    useState("dashboard");

const [isSidebarCollapsed, setIsSidebarCollapsed] =
  useState(false);

      const [businessName, setBusinessName] = useState(
  localStorage.getItem("businessName") || "DappyStock"
);

const [lowStockLimit, setLowStockLimit] = useState(
  Number(localStorage.getItem("lowStockLimit")) || 5
);

const [settingsMessage, setSettingsMessage] = useState("");

const [notification, setNotification] = useState({
  message: "",
  type: "",
});

  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    price: "",
  });

  const [editingId, setEditingId] = useState(null);

  const [checkoutProductId, setCheckoutProductId] =
    useState("");

  const [checkoutQuantity, setCheckoutQuantity] =
    useState(1);

  const [checkoutMessage, setCheckoutMessage] =
    useState("");

  const [checkoutLoading, setCheckoutLoading] =
    useState(false);

  async function fetchProducts() {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load products."
        );
      }

      setProducts(data);
    } catch (error) {
      console.error("Product loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSales() {
    try {
      setSalesLoading(true);

      const response = await fetch(`${API_URL}/api/sales`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load sales history."
        );
      }

      setSales(data);
    } catch (error) {
      console.error("Sales history error:", error);
    } finally {
      setSalesLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeSection === "sales") {
      fetchSales();
    }
  }, [activeSection]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(search) ||
        product.category?.toLowerCase().includes(search)
      );
    });
  }, [products, searchTerm]);

  const totalProducts = products.length;

const totalStock = products.reduce(
  (total, product) =>
    total + Number(product.quantity || 0),
  0
);

const lowStockItems = products.filter(
  (product) =>
    Number(product.quantity) <= Number(lowStockLimit)
).length;

function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

function showNotification(message, type = "success") {
  setNotification({
    message,
    type,
  });

  setTimeout(() => {
    setNotification({
      message: "",
      type: "",
    });
  }, 4000);
}

  async function handleSubmit(event) {
    event.preventDefault();
    const normalizedName = form.name.trim().toLowerCase();

const duplicateProduct = products.find(
  (product) =>
    product.name.trim().toLowerCase() === normalizedName &&
    product.id !== editingId
);

if (duplicateProduct) {
  showNotification(
    `"${form.name.trim()}" already exists. Please update the existing product instead.`,
    "error"
  );

  return;
}

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API_URL}/api/products/${editingId}`
      : `${API_URL}/api/products`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
  showNotification(
    data.message || "Unable to save product.",
    "error"
  );

  return;
}

      await fetchProducts();

      showNotification(
  editingId
    ? "Product updated successfully!"
    : "Product added successfully!",
  "success"
);

      setForm({
        name: "",
        category: "",
        quantity: "",
        price: "",
      });

      setEditingId(null);
    } catch (error) {
      console.error(error);

showNotification(
  "Unable to connect to the server.",
  "error"
);
    }
  }

  function editProduct(product) {
    setEditingId(product.id);

    setForm({
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      price: product.price,
    });

    setActiveSection("products");
  }

  function cancelEdit() {
    setEditingId(null);

    setForm({
      name: "",
      category: "",
      quantity: "",
      price: "",
    });
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
      });

      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCheckout(event) {
    event.preventDefault();

    try {
      setCheckoutLoading(true);
      setCheckoutMessage("");

      const response = await fetch(
        `${API_URL}/api/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: Number(checkoutProductId),
            quantity: Number(checkoutQuantity),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setCheckoutMessage(data.message);
        return;
      }

      setCheckoutMessage("Sale completed successfully!");

      setCheckoutProductId("");
      setCheckoutQuantity(1);

      await fetchProducts();
      await fetchSales();
    } catch (error) {
      console.error(error);

      setCheckoutMessage(
        "Unable to complete checkout."
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

function saveSettings(event) {
  event.preventDefault();

  const cleanBusinessName = businessName.trim();

  if (!cleanBusinessName) {
    setSettingsMessage("Please enter a business name.");
    return;
  }

  if (Number(lowStockLimit) < 1) {
    setSettingsMessage(
      "Low-stock limit must be at least 1."
    );
    return;
  }

  localStorage.setItem(
    "businessName",
    cleanBusinessName
  );

  localStorage.setItem(
    "lowStockLimit",
    String(lowStockLimit)
  );

  setBusinessName(cleanBusinessName);
  setSettingsMessage("Settings saved successfully!");
}
  
  function handleNavigation(sectionId) {
    setActiveSection(sectionId);
  }
    return (
   <div
  className={`app-layout ${
    isSidebarCollapsed
      ? "sidebar-is-collapsed"
      : ""
  }`}
>

{notification.message && (
  <div
    className={`app-notification notification-${notification.type}`}
    role="alert"
  >
    <div className="notification-icon">
      {notification.type === "success" && "✓"}
      {notification.type === "error" && "!"}
      {notification.type === "warning" && "⚠"}
    </div>

    <div className="notification-content">
      <strong>
        {notification.type === "success" && "Success"}
        {notification.type === "error" && "Error"}
        {notification.type === "warning" && "Warning"}
      </strong>

      <p>{notification.message}</p>
    </div>

    <button
      type="button"
      className="notification-close"
      onClick={() =>
        setNotification({
          message: "",
          type: "",
        })
      }
      aria-label="Close notification"
    >
      ×
    </button>
  </div>
)}

     <Sidebar
  activeSection={activeSection}
  onNavigate={handleNavigation}
  isCollapsed={isSidebarCollapsed}
  onToggle={() =>
    setIsSidebarCollapsed((current) => !current)
  }
/>

      <main className="main-content">
    {activeSection === "dashboard" && (
  <header className="topbar">
    <div className="topbar-left">
      <p className="welcome-text">
        👋 Welcome back
      </p>

      <h1>{businessName}</h1>

      <p className="topbar-subtitle">
        Manage your inventory efficiently and keep your business growing.
      </p>
    </div>

    <div className="topbar-right">
      <div className="profile-circle">
        {businessName.charAt(0).toUpperCase()}
      </div>
    </div>
  </header>
)}
        {activeSection === "dashboard" && (
          <section id="dashboard">
            <SummaryCards
              totalProducts={totalProducts}
              totalStock={totalStock}
              lowStockItems={lowStockItems}
            />

            <InventoryChart
              products={products}
            />

            <InventoryInsights
              products={products}
            />
          </section>
        )}

        {activeSection === "products" && (
          <section
            id="products"
            className="inventory-section"
          >
<div className="products-header">
  <div>
    <h2>Products</h2>

    <p>
      Add, update and manage all products in your inventory.
    </p>
  </div>

  <input
    className="product-search"
    type="text"
    placeholder="🔍 Search by product or category..."
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(e.target.value)
    }
  />
</div>

           <h3>
  {editingId
    ? "Edit Product"
    : "Add New Product"}
</h3>
            <form
              onSubmit={handleSubmit}
              className="product-form"
            >
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={form.quantity}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                name="price"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
                required
              />

              <button type="submit">
                {editingId
                  ? "Update Product"
                  : "Add Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </form>

            {loading ? (
              <p>Loading products...</p>
            ) : (
              <div className="table-wrapper">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map(
                      (product) => (
                        <tr key={product.id}>
                          <td>
                            {product.name}
                          </td>

                          <td>
                            {product.category}
                          </td>

                          <td>
                            {product.quantity}
                          </td>

                          <td>
                            ₦
                            {Number(
                              product.price
                            ).toLocaleString()}
                          </td>

                          <td>
                            <button
                              onClick={() =>
                                editProduct(
                                  product
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                deleteProduct(
                                  product.id
                                )
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    )}

                    {filteredProducts.length ===
                      0 && (
                      <tr>
                        <td colSpan="5">
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
                {activeSection === "checkout" && (
          <section id="checkout" className="page-section">
            <h2>Checkout</h2>

            <p>
              Select a product and enter the quantity purchased.
            </p>

            <form
              onSubmit={handleCheckout}
              className="checkout-form"
            >
              <label>
                Select Product

                <select
                  value={checkoutProductId}
                  onChange={(event) => {
                    setCheckoutProductId(
                      event.target.value
                    );

                    setCheckoutMessage("");
                  }}
                  required
                >
                  <option value="">
                    Choose a product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                      disabled={
                        Number(product.quantity) === 0
                      }
                    >
                      {product.name} —{" "}
                      {product.quantity} available
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Quantity Purchased

                <input
                  type="number"
                  min="1"
                  value={checkoutQuantity}
                  onChange={(event) => {
                    setCheckoutQuantity(
                      event.target.value
                    );

                    setCheckoutMessage("");
                  }}
                  required
                />
              </label>

              {checkoutProductId && (
                <div className="checkout-summary">
                  {(() => {
                    const selectedProduct =
                      products.find(
                        (product) =>
                          String(product.id) ===
                          String(
                            checkoutProductId
                          )
                      );

                    if (!selectedProduct) {
                      return null;
                    }

                    const total =
                      Number(
                        selectedProduct.price
                      ) *
                      Number(
                        checkoutQuantity || 0
                      );

                    return (
                      <>
                        <p>
                          <strong>Product:</strong>{" "}
                          {selectedProduct.name}
                        </p>

                        <p>
                          <strong>
                            Available Stock:
                          </strong>{" "}
                          {
                            selectedProduct.quantity
                          }
                        </p>

                        <p>
                          <strong>
                            Unit Price:
                          </strong>{" "}
                          ₦
                          {Number(
                            selectedProduct.price
                          ).toLocaleString()}
                        </p>

                        <p>
                          <strong>Total:</strong>{" "}
                          ₦
                          {total.toLocaleString()}
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  checkoutLoading ||
                  !checkoutProductId
                }
              >
                {checkoutLoading
                  ? "Processing Sale..."
                  : "Complete Sale"}
              </button>

              {checkoutMessage && (
                <p className="checkout-message">
                  {checkoutMessage}
                </p>
              )}
            </form>
          </section>
        )}

        {activeSection === "sales" && (
          <section id="sales" className="page-section">
            <h2>Sales History</h2>

            <p>
              View all completed sales recorded by the
              system.
            </p>

            {salesLoading ? (
              <p>Loading sales...</p>
            ) : (
              <div className="table-wrapper">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.id}>
                        <td>
                          {new Date(
                            sale.sale_date
                          ).toLocaleString()}
                        </td>

                        <td>
                          {sale.product_name}
                        </td>

                        <td>{sale.quantity}</td>

                        <td>
                          ₦
                          {Number(
                            sale.unit_price
                          ).toLocaleString()}
                        </td>

                        <td>
                          ₦
                          {Number(
                            sale.total_price
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}

                    {sales.length === 0 && (
                      <tr>
                        <td colSpan="5">
                          No sales have been
                          recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
                {activeSection === "alerts" && (
          <section id="alerts" className="page-section">
            <h2>Stock Alerts</h2>

            {products.filter(
  (product) =>
    Number(product.quantity) <= Number(lowStockLimit)
).length === 0 ? (
              <p>No low-stock products at the moment.</p>
            ) : (
              <div className="alerts-list">
                {products
                  .filter(
  (product) =>
    Number(product.quantity) <= Number(lowStockLimit)
)
                  .map((product) => (
                    <div
                      className="alert-card"
                      key={product.id}
                    >
                      <h3>{product.name}</h3>

                      <p>
                        Category: {product.category}
                      </p>

                      <p>
                        Only {product.quantity} item(s)
                        remaining.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          editProduct(product);
                        }}
                      >
                        Restock Product
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}

        {activeSection === "reports" && (
          <section className="page-section">
            <h2>Inventory Reports</h2>

            <div className="report-grid">
              <div className="report-card">
                <h3>Total Products</h3>
                <p>{totalProducts}</p>
              </div>

              <div className="report-card">
                <h3>Total Units</h3>
                <p>{totalStock}</p>
              </div>

              <div className="report-card">
                <h3>Low Stock</h3>
                <p>{lowStockItems}</p>
              </div>

              <div className="report-card">
                <h3>Total Inventory Value</h3>

                <p>
                  ₦
                  {products
                    .reduce(
                      (sum, product) =>
                        sum +
                        Number(product.quantity) *
                          Number(product.price),
                      0
                    )
                    .toLocaleString()}
                </p>
              </div>
            </div>

            <InventoryChart products={products} />
          </section>
        )}

      {activeSection === "settings" && (
  <section
    id="settings"
    className="page-section"
  >
    <div className="section-heading">
      <div>
        <p className="section-label">
          Application preferences
        </p>

        <h2>Settings</h2>

        <p>
          Update your business information and
          inventory alert level.
        </p>
      </div>
    </div>

    <form
      className="settings-card"
      onSubmit={saveSettings}
    >
      <label>
        Business Name

        <input
          type="text"
          value={businessName}
          onChange={(event) => {
            setBusinessName(event.target.value);
            setSettingsMessage("");
          }}
          placeholder="Enter business name"
        />
      </label>

      <label>
        Low Stock Limit

        <input
          type="number"
          min="1"
          value={lowStockLimit}
          onChange={(event) => {
            setLowStockLimit(event.target.value);
            setSettingsMessage("");
          }}
        />

        <small>
          Products with this quantity or less will
          appear under Stock Alerts.
        </small>
      </label>

      <button type="submit">
        Save Settings
      </button>

      {settingsMessage && (
        <p className="settings-message">
          {settingsMessage}
        </p>
      )}
    </form>
  </section>
)}

<footer className="app-footer">
  <div>
    <strong>DappyStock Inventory System</strong>

    <p>
      Built with React, Express and SQLite
    </p>
  </div>

  <span>
    © 2026 Dappy Josh Technologies
  </span>
</footer>
      </main>
    </div>
  );
}

export default App;