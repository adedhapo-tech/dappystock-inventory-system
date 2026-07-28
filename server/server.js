const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const database = new Database("inventory.db");

database.prepare(`
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    sale_date TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

database.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    price REAL NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.get("/", (req, res) => {
  res.json({
    message: "DappyStock API is running",
  });
});

app.get("/api/products", (req, res) => {
  try {
    const products = database
      .prepare("SELECT * FROM products ORDER BY id DESC")
      .all();

    res.json(products);
 } catch (error) {
  console.error("Error fetching products:", error);

  res.status(500).json({
    message: "Unable to fetch products.",
  });
}
});

app.post("/api/products", (req, res) => {
  try {
    const { name, category, quantity, price } = req.body;

    if (
      !name?.trim() ||
      !category?.trim() ||
      quantity === undefined ||
      price === undefined
    ) {
      return res.status(400).json({
        message: "All product fields are required.",
      });
    }

    const result = database
      .prepare(`
        INSERT INTO products (name, category, quantity, price)
        VALUES (?, ?, ?, ?)
      `)
      .run(
        name.trim(),
        category.trim(),
        Number(quantity),
        Number(price)
      );

    const newProduct = database
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to add product.",
    });
  }
});

app.put("/api/products/:id", (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { name, category, quantity, price } = req.body;

    const existingProduct = database
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(productId);

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    database
      .prepare(`
        UPDATE products
        SET name = ?, category = ?, quantity = ?, price = ?
        WHERE id = ?
      `)
      .run(
        name.trim(),
        category.trim(),
        Number(quantity),
        Number(price),
        productId
      );

    const updatedProduct = database
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(productId);

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to update product.",
    });
  }
});

app.delete("/api/products/:id", (req, res) => {
  try {
    const productId = Number(req.params.id);

    const result = database
      .prepare("DELETE FROM products WHERE id = ?")
      .run(productId);

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.json({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to delete product.",
    });
  }
});

app.post("/api/checkout", (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const saleQuantity = Number(quantity);

    if (!productId || saleQuantity <= 0) {
      return res.status(400).json({
        message: "Please select a product and enter a valid quantity.",
      });
    }

    const product = database
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    if (saleQuantity > Number(product.quantity)) {
      return res.status(400).json({
        message: `Only ${product.quantity} item(s) are available.`,
      });
    }

    const remainingQuantity =
      Number(product.quantity) - saleQuantity;

    database.prepare(
      "UPDATE products SET quantity = ? WHERE id = ?"
    ).run(remainingQuantity, productId);

const totalPrice =
  saleQuantity * Number(product.price);

database.prepare(`
  INSERT INTO sales (
    product_id,
    product_name,
    quantity,
    unit_price,
    total_price
  )
  VALUES (?, ?, ?, ?, ?)
`).run(
  product.id,
  product.name,
  saleQuantity,
  Number(product.price),
  totalPrice
);

    const updatedProduct = database
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(productId);

    res.json({
      message: "Checkout completed successfully.",
      product: updatedProduct,
    });
 } catch (error) {
  console.error("FULL CHECKOUT ERROR:", error);

  res.status(500).json({
    message: error.message,
  });
}
});

app.get("/api/sales", (req, res) => {
  try {
    const sales = database
      .prepare(`
        SELECT *
        FROM sales
        ORDER BY id DESC
      `)
      .all();

    res.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});