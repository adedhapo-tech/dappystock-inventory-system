const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const database = new Database("inventory.db");

/* =====================================
   CREATE DATABASE TABLES
===================================== */

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

database.exec(`
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    sale_date TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

/* =====================================
   API HOME
===================================== */

app.get("/", (req, res) => {
  res.json({
    message: "DappyStock API is running",
  });
});

/* =====================================
   GET ALL PRODUCTS
===================================== */

app.get("/api/products", (req, res) => {
  try {
    const products = database
      .prepare(`
        SELECT *
        FROM products
        ORDER BY id DESC
      `)
      .all();

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);

    res.status(500).json({
      message: "Unable to fetch products.",
    });
  }
});

/* =====================================
   ADD A PRODUCT
===================================== */

app.post("/api/products", (req, res) => {
  try {
    const { name, category, quantity, price } = req.body;

    const cleanName = String(name || "").trim();
    const cleanCategory = String(category || "").trim();

    const productQuantity = Number(quantity);
    const productPrice = Number(price);

    if (
      !cleanName ||
      !cleanCategory ||
      quantity === undefined ||
      quantity === "" ||
      price === undefined ||
      price === ""
    ) {
      return res.status(400).json({
        message: "All product fields are required.",
      });
    }

    if (
      !Number.isFinite(productQuantity) ||
      productQuantity < 0
    ) {
      return res.status(400).json({
        message: "Quantity must be a valid number.",
      });
    }

    if (
      !Number.isFinite(productPrice) ||
      productPrice < 0
    ) {
      return res.status(400).json({
        message: "Price must be a valid number.",
      });
    }

    /*
      Prevent duplicate product names.

      These will be treated as the same product:
      Peak Milk
      peak milk
      PEAK MILK
      " Peak Milk "
    */

    const duplicateProduct = database
      .prepare(`
        SELECT id, name
        FROM products
        WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
      `)
      .get(cleanName);

    if (duplicateProduct) {
      return res.status(409).json({
        message: `"${cleanName}" already exists. Please update the existing product instead.`,
      });
    }

    const result = database
      .prepare(`
        INSERT INTO products (
          name,
          category,
          quantity,
          price
        )
        VALUES (?, ?, ?, ?)
      `)
      .run(
        cleanName,
        cleanCategory,
        productQuantity,
        productPrice
      );

    const newProduct = database
      .prepare(`
        SELECT *
        FROM products
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error adding product:", error);

    res.status(500).json({
      message: "Unable to add product.",
    });
  }
});

/* =====================================
   UPDATE A PRODUCT
===================================== */

app.put("/api/products/:id", (req, res) => {
  try {
    const productId = Number(req.params.id);

    const { name, category, quantity, price } = req.body;

    const cleanName = String(name || "").trim();
    const cleanCategory = String(category || "").trim();

    const productQuantity = Number(quantity);
    const productPrice = Number(price);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    if (
      !cleanName ||
      !cleanCategory ||
      quantity === undefined ||
      quantity === "" ||
      price === undefined ||
      price === ""
    ) {
      return res.status(400).json({
        message: "All product fields are required.",
      });
    }

    if (
      !Number.isFinite(productQuantity) ||
      productQuantity < 0
    ) {
      return res.status(400).json({
        message: "Quantity must be a valid number.",
      });
    }

    if (
      !Number.isFinite(productPrice) ||
      productPrice < 0
    ) {
      return res.status(400).json({
        message: "Price must be a valid number.",
      });
    }

    const existingProduct = database
      .prepare(`
        SELECT *
        FROM products
        WHERE id = ?
      `)
      .get(productId);

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    /*
      Prevent changing a product name to the name
      of another existing product.

      The current product is excluded using:
      id != ?
    */

    const duplicateProduct = database
      .prepare(`
        SELECT id, name
        FROM products
        WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
        AND id != ?
      `)
      .get(cleanName, productId);

    if (duplicateProduct) {
      return res.status(409).json({
        message: `"${cleanName}" already belongs to another product.`,
      });
    }

    database
      .prepare(`
        UPDATE products
        SET
          name = ?,
          category = ?,
          quantity = ?,
          price = ?
        WHERE id = ?
      `)
      .run(
        cleanName,
        cleanCategory,
        productQuantity,
        productPrice,
        productId
      );

    const updatedProduct = database
      .prepare(`
        SELECT *
        FROM products
        WHERE id = ?
      `)
      .get(productId);

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);

    res.status(500).json({
      message: "Unable to update product.",
    });
  }
});

/* =====================================
   DELETE A PRODUCT
===================================== */

app.delete("/api/products/:id", (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const result = database
      .prepare(`
        DELETE FROM products
        WHERE id = ?
      `)
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
    console.error("Error deleting product:", error);

    res.status(500).json({
      message: "Unable to delete product.",
    });
  }
});

/* =====================================
   CHECKOUT TRANSACTION
===================================== */

const completeCheckout = database.transaction(
  (productId, saleQuantity) => {
    const product = database
      .prepare(`
        SELECT *
        FROM products
        WHERE id = ?
      `)
      .get(productId);

    if (!product) {
      const error = new Error("Product not found.");
      error.statusCode = 404;
      throw error;
    }

    if (saleQuantity > Number(product.quantity)) {
      const error = new Error(
        `Only ${product.quantity} item(s) are available.`
      );

      error.statusCode = 400;
      throw error;
    }

    const remainingQuantity =
      Number(product.quantity) - saleQuantity;

    const totalPrice =
      saleQuantity * Number(product.price);

    database
      .prepare(`
        UPDATE products
        SET quantity = ?
        WHERE id = ?
      `)
      .run(remainingQuantity, productId);

    database
      .prepare(`
        INSERT INTO sales (
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price
        )
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        product.id,
        product.name,
        saleQuantity,
        Number(product.price),
        totalPrice
      );

    const updatedProduct = database
      .prepare(`
        SELECT *
        FROM products
        WHERE id = ?
      `)
      .get(productId);

    return updatedProduct;
  }
);

app.post("/api/checkout", (req, res) => {
  try {
    const productId = Number(req.body.productId);
    const saleQuantity = Number(req.body.quantity);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return res.status(400).json({
        message: "Please select a valid product.",
      });
    }

    if (
      !Number.isInteger(saleQuantity) ||
      saleQuantity <= 0
    ) {
      return res.status(400).json({
        message: "Please enter a valid quantity.",
      });
    }

    const updatedProduct = completeCheckout(
      productId,
      saleQuantity
    );

    res.json({
      message: "Checkout completed successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Full checkout error:", error);

    res.status(error.statusCode || 500).json({
      message:
        error.message || "Unable to complete checkout.",
    });
  }
});

/* =====================================
   GET SALES HISTORY
===================================== */

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
      message: "Unable to fetch sales history.",
    });
  }
});

/* =====================================
   START SERVER
===================================== */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});