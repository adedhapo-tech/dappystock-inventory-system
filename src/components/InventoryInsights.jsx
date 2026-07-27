function InventoryInsights({ products }) {
  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) => product.quantity <= 5
  );

  const healthyProducts = products.filter(
    (product) => product.quantity > 5
  ).length;

  const healthScore =
    totalProducts === 0
      ? 0
      : Math.round((healthyProducts / totalProducts) * 100);

  let healthStatus = "Needs Attention";

  if (healthScore >= 80) {
    healthStatus = "Excellent";
  } else if (healthScore >= 60) {
    healthStatus = "Good";
  }

  return (
    <section className="insights-grid">
      <article className="health-card">
        <div>
          <p className="eyebrow">Inventory condition</p>
          <h2>Inventory Health</h2>
        </div>

        <div className="health-score">
          <strong>{healthScore}%</strong>
          <span>{healthStatus}</span>
        </div>

        <div className="health-progress">
          <div
            className="health-progress-fill"
            style={{ width: `${healthScore}%` }}
          />
        </div>

        <p className="health-message">
          {healthScore >= 80
            ? "Your inventory is in excellent condition."
            : healthScore >= 60
            ? "Your inventory is stable, but some items need attention."
            : "Several products need to be restocked soon."}
        </p>
      </article>

      <article className="restock-card">
        <div>
          <p className="eyebrow">Smart recommendation</p>
          <h2>Restock Suggestions</h2>
        </div>

        <div className="restock-list">
          {lowStockProducts.length === 0 ? (
            <p className="empty-message">
              No products currently need restocking.
            </p>
          ) : (
            lowStockProducts.map((product) => {
              const suggestedAmount = Math.max(
                10 - product.quantity,
                1
              );

              return (
                <div className="restock-item" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <p>
                      Current stock: {product.quantity}
                    </p>
                  </div>

                  <span>
                    Add {suggestedAmount}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </article>
    </section>
  );
}

export default InventoryInsights;