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
    (product) => Number(product.quantity) <= 5
  ).length;
    function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

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
        alert(data.message);
        return;
      }

      await fetchProducts();

      setForm({
        name: "",
        category: "",
        quantity: "",
        price: "",
      });

      setEditingId(null);
    } catch (error) {
      console.error(error);
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

  function handleNavigation(sectionId) {
    setActiveSection(sectionId);
  }
    return (
    <div className="app-layout">
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigation}
      />

      <main className="main-content">
        <header className="topbar">
          <h1>DappyStock Inventory System</h1>

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </header>

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
            <h2>
              {editingId
                ? "Edit Product"
                : "Add Product"}
            </h2>

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
              (product) => Number(product.quantity) <= 5
            ).length === 0 ? (
              <p>No low-stock products at the moment.</p>
            ) : (
              <div className="alerts-list">
                {products
                  .filter(
                    (product) =>
                      Number(product.quantity) <= 5
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
          <section className="page-section">
            <h2>Settings</h2>

            <div className="settings-card">
              <label>
                Business Name

                <input
                  type="text"
                  defaultValue="DappyStock"
                />
              </label>

              <label>
                Low Stock Limit

                <input
                  type="number"
                  defaultValue="5"
                />
              </label>

              <button
                onClick={() =>
                  alert("Settings saved.")
                }
              >
                Save Settings
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;