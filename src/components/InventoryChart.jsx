import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function InventoryChart({ products }) {
  const categoryTotals = products.reduce((totals, product) => {
    const category = product.category.trim() || "Other";

    totals[category] =
      (totals[category] || 0) + product.quantity;

    return totals;
  }, {});

  const chartData = Object.entries(categoryTotals).map(
    ([category, quantity]) => ({
      category,
      quantity,
    })
  );

  return (
    <article className="chart-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Inventory analytics</p>
          <h2>Stock by Category</h2>
        </div>
      </div>

      {chartData.length === 0 ? (
        <p className="empty-message">
          Add products to display the chart.
        </p>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="category"
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip />

              <Bar
                dataKey="quantity"
                fill="#7c3aed"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}

export default InventoryChart;