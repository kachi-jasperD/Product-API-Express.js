/*
1) Line 8 - Module to generate a random UUID to serve as a unique identifier for each product.
2) Line 9 - Imports the Express framework to create a web server and handle HTTP requests.
3) Line 10 - Initializes an Express application instance.
4) Line 11 - Middleware to parse incoming JSON request bodies.
*/

const randomUUID = require("crypto").randomUUID;
const express = require("express");
const app = express();
app.use(express.json());
var { expressjwt: jwt } = require("express-jwt");
const password = "my_secret_key";
const salt = ["HS256"];

/* 
5) Line 19 - Initializes an empty array to store product data in memory.
*/
let products = [];

/*  CREATE SERVER 
6) Line 24-27 - Creates and starts the server on port 8080, logging a message to indicate that the server is running.
*/
const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

//Define the CRUD routes for managing products

/* GET ROUTE
7) Line 34-43 - Defines a GET route at "/products" that returns the list of products with a success message.
*/
app.get(
  "/products",
  jwt({ secret: password, algorithms: salt }),
  (req, res) => {
    res.status(200).json({
      products,
      message: "Products retrieved successfully",
    });
  }
);

/* POST ROUTE
8) Line 48-68 - Defines a POST route at "/add-product" that adds a new product to the products array, generating a unique ID for it, and returns the added product with a success message. It also handles empty request body.
*/
app.post(
  "/add-product",
  jwt({ secret: password, algorithms: salt }),
  (req, res) => {
    if (req.body === undefined || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const product = {
      id: randomUUID(),
      ...req.body,
    };

    products.push(product);

    res.status(201).json({
      product,
      message: "Product added successfully",
    });
  }
);

/* PUT ROUTE
9) Line 73-99 - Defines a PUT route at "/update-product/:id" that updates an existing product based on its ID, returning the updated product with a success message. It handles empty request body and cases where the product is not found.
*/
app.put(
  "/update-product/:id",
  jwt({ secret: password, algorithms: salt }),
  (req, res) => {
    if (req.body === undefined || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const { id } = req.params;

    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found" });
    }

    products[productIndex] = {
      ...products[productIndex],
      ...req.body,
    };

    res.json({
      product: products[productIndex],
      message: "Product updated successfully",
    });
  }
);

/* DELETE ROUTE
10) Line 104-114 - Defines a DELETE route at "/delete-product/:id" that removes a product from the products array based on its ID and returns a success message. And updates the products array to exclude the deleted product.
*/
app.delete(
  "/delete-product/:id",
  jwt({ secret: password, algorithms: salt }),
  (req, res) => {
    const { id } = req.params;

    const newProductsList = products.filter((p) => p.id !== id);
    products = newProductsList;
    res.send(`Product with ID ${id} deleted successfully`);
  }
);

/* GET ROUTE
7) Line 119-144 - Defines a GET route at "/product/:id" that returns a specific product by ID with a success message.
*/
app.get(
  "/product/:id",
  jwt({ secret: password, algorithms: salt }),
  (req, res) => {
    const id = req.params.id;

    const product = products.find((p) => p.id === id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      product,
      message: "Product retrieved successfully",
    });
  }
);

// JWT error handler
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Invalid or missing token" });
  }
  next(err);
});

// End of file
