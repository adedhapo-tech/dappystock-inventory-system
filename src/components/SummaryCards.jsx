import {
  FaBoxes,
  FaWarehouse,
  FaExclamationTriangle,
} from "react-icons/fa";

function SummaryCards({
  totalProducts,
  totalStock,
  lowStockItems,
}) {
  return (
    <section className="summary-grid">
      <article className="summary-card summary-blue">
        <div className="summary-card-top">
          <div className="summary-icon">
            <FaBoxes />
          </div>

          <span className="summary-badge">
            Products
          </span>
        </div>

        <div className="summary-card-content">
          <p>Total Products</p>
          <h2>{totalProducts}</h2>

          <span className="summary-description">
            All products currently registered
          </span>
        </div>
      </article>

      <article className="summary-card summary-green">
        <div className="summary-card-top">
          <div className="summary-icon">
            <FaWarehouse />
          </div>

          <span className="summary-badge">
            Inventory
          </span>
        </div>

        <div className="summary-card-content">
          <p>Units in Stock</p>
          <h2>{totalStock}</h2>

          <span className="summary-description">
            Total available units in inventory
          </span>
        </div>
      </article>

      <article className="summary-card summary-orange">
        <div className="summary-card-top">
          <div className="summary-icon">
            <FaExclamationTriangle />
          </div>

          <span className="summary-badge">
            Attention
          </span>
        </div>

        <div className="summary-card-content">
          <p>Low Stock Items</p>
          <h2>{lowStockItems}</h2>

          <span className="summary-description">
            Products that may need restocking
          </span>
        </div>
      </article>
    </section>
  );
}

export default SummaryCards;