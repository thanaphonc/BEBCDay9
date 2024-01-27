const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = 3000;
const swaggerUI = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

app.use(bodyParser.json());
app.use(cors());

//app.use(express.json());
const myLogger = (req, res, next) => {
  console.log("LOGGED");
  next();
};

app.use(myLogger);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong.");
});
/**
 * @swagger
 * /products:
 *  get:
 *    summary: Get all products
 *    responses:
 *      200:
 *        description: Successfull response
 *      500:
 *        description: Internal server error
 */

app.get("/products", (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({
        message: "Error occurred while retrieving products.",
        error: err,
      });
    } else {
      res.status(200).json(result);
    }
  });
});

/**
 * @swagger
 * /products/{productId}:
 *  get:
 *    summary: Get product by ID
 *    parameters:
 *      - in: path
 *        name: productId
 *        schema:
 *          type: integer
 *    responses:
 *      200:
 *        description: Successfull response
 *      500:
 *        description: Internal server error
 */

app.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const sql = "SELECT * FROM products WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      res.status(500).json({
        message: "Error occurred while retrieving products.",
        error: err,
      });
    } else {
      if (result.length === 0) {
        res.status(404).json({ message: "Product not found." });
      } else {
        res.status(200).json(result);
      }
    }
  });
});

/**
/**
 * @swagger
 * /products:
 *  post:
 *    summary: Add a new product
 *    requestBody:
 *      description: Optional description in *Markdown*
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *          example:
 *            name: product1
 *            price: 1000
 *            discount: 800
 *            review_count: 99
 *            image_url: https://example.com/image.jpg
 *    responses:
 *      200:
 *        description: Created Successfull
 *      500:
 *        description: Internal server error
 */

app.post("/products", (req, res) => {
  const product = req.body;
  const sql =
    "INSERT INTO products (name, price, discount, review_count, image_url) VALUES (?, ?, ?, ?, ?)";
  db.query(
    sql,
    [
      product.name,
      product.price,
      product.discount,
      product.review_count,
      product.image_url,
    ],
    (err, result) => {
      if (err) {
        res.status(500).json({
          message: "Error occurred while inserting product.",
          error: err,
        });
      } else {
        res.status(201).json({ message: "Product inserted successfully." });
      }
    }
  );
});

/**
/**
 * @swagger
 * /products/{productId}:
 *  put:
 *    summary: Update product
 *    parameters:
 *      - in: path
 *        name: productId
 *        schema:
 *          type: integer
 *    requestBody:
 *      description: Optional description in *Markdown*
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *          example:
 *            name: product1
 *            price: 1000
 *            discount: 800
 *            review_count: 99
 *            image_url: https://example.com/image.jpg
 *    responses:
 *      200:
 *        description: Updated Successfull
 *      500:
 *        description: Internal server error
 */

app.put("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = req.body;
  const sql =
    "UPDATE products SET name = ?, price = ?, discount = ?, review_count = ?, image_url = ? WHERE id = ?";
  db.query(
    sql,
    [
      product.name,
      product.price,
      product.discount,
      product.review_count,
      product.image_url,
      id,
    ],
    (err, result) => {
      if (err) {
        res.status(500).json({
          message: "Error occurred while updating product.",
          error: err,
        });
      } else {
        res.status(201).json({ message: "Product updated successfully." });
      }
    }
  );
});

/**
 * @swagger
 * /products/{productId}:
 *  delete:
 *    summary: Delete product by ID
 *    parameters:
 *      - in: path
 *        name: productId
 *        schema:
 *          type: integer
 *    responses:
 *      200:
 *        description: Deleted Successfull
 *      500:
 *        description: Internal server error
 */

app.delete("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const sql = "DELETE FROM products WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      res.status(500).json({
        message: "Error occurred while deleting product.",
        errer: err,
      });
    } else {
      res.status(200).json({ message: "Product deleted successfull.y" });
    }
  });
});

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API Documentation",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["server.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
