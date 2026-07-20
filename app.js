require("dotenv").config();
const path = require("path");
 
const express = require("express");
 
const sequelize = require("./config/database");
const Product = require("./models/product");
 
const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
 
app.use(
    express.static(
        path.join(__dirname, "public")
    )
);
 
app.use(express.urlencoded({ extended: true }));
 
app.use(express.json());


app.get("/", (req, res) => {
    res.status(200).json({
        message: "WEB700 Neon PostgreSQL Lab"
    });
});
 
app.get("/health", async (req, res) => {
    try {
        await sequelize.authenticate();
 
        res.status(200).json({
            success: true,
            message: "Connected to Neon PostgreSQL."
        });
    } catch (error) {
        console.error("Health check failed:", error.message);
 
        res.status(500).json({
            success: false,
            message: "Database connection failed."
        });
    }
});
 
app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [["id", "ASC"]]
        });
 
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error("Product query failed:", error.message);
 
        res.status(500).json({
            success: false,
            message: "Unable to retrieve products."
        });
    }
});

app.get("/products", async (req, res, next) => {
    try {
        const products = await Product.findAll({
            order: [["name", "ASC"]]
        });
 
        res.render("products/index", {
            products
        });
    } catch (error) {
        next(error);
    }
});

app.get("/products/new", (req, res) => {
    res.render("products/new", {
        errors: [],
        values: {}
    });
});

app.get("/products/:id", async (req, res, next) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
 
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).render("error", {
                status: 400,
                message: "A valid product ID is required."
            });
        }
 
        const product = await Product.findByPk(id);
 
        if (!product) {
            return res.status(404).render("error", {
                status: 404,
                message: "Product not found."
            });
        }
 
        res.render("products/details", {
            product
        });
    } catch (error) {
        next(error);
    }
});

app.get("/products/:id/edit", async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
 
        if (!product) {
            return res.status(404).render("error", {
                status: 404,
                message: "Product not found."
            });
        }
 
        res.render("products/edit", {
            product,
            errors: []
        });
    } catch (error) {
        next(error);
    }
});

app.post(
    "/products/:id/update",
    async (req, res, next) => {
        try {
            const product = await Product.findByPk(
                req.params.id
            );
 
            if (!product) {
                return res.status(404).render("error", {
                    status: 404,
                    message: "Product not found."
                });
            }
 
            const name = req.body.name?.trim();
            const category = req.body.category?.trim();
            const brand = req.body.brand?.trim() || null;
            const price = Number(req.body.price);
            const stockQuantity = Number(
                req.body.stockQuantity
            );
            const available =
                req.body.available === "on";
 
            const errors = [];
 
            if (!name) {
                errors.push("Name is required.");
            }
 
            if (!category) {
                errors.push("Category is required.");
            }
 
            if (!Number.isFinite(price) || price < 0) {
                errors.push(
                    "Price must be zero or greater."
                );
            }
 
            if (
                !Number.isInteger(stockQuantity) ||
                stockQuantity < 0
            ) {
                errors.push(
                    "Stock quantity must be a non-negative whole number."
                );
            }
 
            if (errors.length > 0) {
                return res.status(400).render(
                    "products/edit",
                    {
                        product: {
                            ...product.toJSON(),
                            ...req.body
                        },
                        errors
                    }
                );
            }
 
            await product.update({
                name,
                category,
                brand,
                price,
                stockQuantity,
                available,
                updatedAt: new Date()
            });
 
            res.redirect(`/products/${product.id}`);
        } catch (error) {
            next(error);
        }
    }
);

app.post("/products", async (req, res, next) => {
    try {
        const name = req.body.name?.trim();
        const category = req.body.category?.trim();
        const brand = req.body.brand?.trim() || null;
        const price = Number(req.body.price);
        const stockQuantity = Number(req.body.stockQuantity);
        const available = req.body.available === "on";
 
        const errors = [];
 
        if (!name) {
            errors.push("Name is required.");
        }
 
        if (!category) {
            errors.push("Category is required.");
        }
 
        if (!Number.isFinite(price) || price < 0) {
            errors.push("Price must be zero or greater.");
        }
 
        if (
            !Number.isInteger(stockQuantity) ||
            stockQuantity < 0
        ) {
            errors.push(
                "Stock quantity must be a non-negative whole number."
            );
        }
 
        if (errors.length > 0) {
            return res.status(400).render("products/new", {
                errors,
                values: req.body
            });
        }
 
        await Product.create({
            name,
            category,
            brand,
            price,
            stockQuantity,
            available
        });
 
        res.redirect("/products");
    } catch (error) {
        next(error);
    }
});

app.post(
    "/products/:id/delete",
    async (req, res, next) => {
        try {
            const product = await Product.findByPk(
                req.params.id
            );
 
            if (!product) {
                return res.status(404).render("error", {
                    status: 404,
                    message: "Product not found."
                });
            }
 
            await product.destroy();
 
            res.redirect("/products");
        } catch (error) {
            next(error);
        }
    }
);

app.use((req, res) => {
    res.status(404).render("error", {
        status: 404,
        message: "The requested page was not found."
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

app.use((error, req, res, next) => {
    console.error(error);
 
    res.status(500).render("error", {
        status: 500,
        message: "An unexpected application error occurred."
    });
});
 
async function startServer() {
    try {
        await sequelize.authenticate();
 
        console.log("Connected to Neon PostgreSQL.");
 
        app.listen(PORT, () => {
            console.log(
                `Server running at http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "Unable to start the application:",
            error.message
        );
 
        process.exit(1);
    }
}
 
if (require.main === module) {
    startServer();
}
 
module.exports = app;