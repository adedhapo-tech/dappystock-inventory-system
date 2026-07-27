import {
  FaBoxes,
  FaWarehouse,
  FaExclamationTriangle,
} from "react-icons/fa";

function SummaryCards({ totalProducts, totalStock, lowStockItems }) {
  return (
    <section className="summary-grid">

      <article className="summary-card blue">
        <div className="card-icon">
  <FaBoxes />
</div>

        <p>Total Products</p>

        <h2>{totalProducts}</h2>
      </article>

      <article className="summary-card green">
        <div className="card-icon">
  <FaWarehouse />
</div>

        <p>Units in Stock</p>

        <h2>{totalStock}</h2>
      </article>

      <article className="summary-card orange">
       <div className="card-icon">
  <FaExclamationTriangle />
</div>

        <p>Low Stock</p>

        <h2>{lowStockItems}</h2>
      </article>

    </section>
  );
}

export default SummaryCards;