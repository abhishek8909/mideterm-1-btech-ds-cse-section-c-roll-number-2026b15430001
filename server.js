
const http = require('http');

// Initial product inventory
let products = [
    {
        id: 1,
        name: "Wireless Mouse",
        price: 500,
        category: "Electronics"
    }
];

function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify(data, null, 2));
}

async function getRequestBody(req) {
    let body = "";

    for await (const chunk of req) {
        body += chunk;
    }

    return JSON.parse(body);
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    const path = url.pathname;
    const method = req.method;

    if (method === "GET" && path === "/products") {
        return sendResponse(res, 200, {
            message: "All products retrieved successfully",
            products: products
        });
    }


    if (method === "GET" && /^\/products\/\d+$/.test(path)) {
        const id = Number(path.split("/")[2]);
        const product = products.find(p => p.id === id);

        if (!product) {
            return sendResponse(res, 404, {
                message: "Product not found"
            });
        }

        return sendResponse(res, 200, product);
    }

    if (method === "POST" && path === "/products") {
        try {
            const data = await getRequestBody(req);

            if (
                typeof data.name !== "string" || !data.name.trim() ||
                typeof data.price !== "number" ||
                !Number.isFinite(data.price) || data.price <= 0 ||
                typeof data.category !== "string" || !data.category.trim()
            ) {
                return sendResponse(res, 400, {
                    message: "Please enter valid name, price and category"
                });
            }

            const newProduct = {
                id: products.length
                    ? Math.max(...products.map(p => p.id)) + 1
                    : 1,
                name: data.name.trim(),
                price: data.price,
                category: data.category.trim()
            };

            products.push(newProduct);

            return sendResponse(res, 201, {
                message: "Product added successfully",
                product: newProduct
            });

        } catch (error) {
            return sendResponse(res, 400, {
                message: "Invalid JSON request body"
            });
        }
    }

    // PUT: Update an existing product
    if (method === "PUT" && /^\/products\/\d+$/.test(path)) {
        const id = Number(path.split("/")[2]);
        const product = products.find(p => p.id === id);

        if (!product) {
            return sendResponse(res, 404, {
                message: "Product not found"
            });
        }

        try {
            const data = await getRequestBody(req);

            if (
                typeof data.name !== "string" || !data.name.trim() ||
                typeof data.price !== "number" ||
                !Number.isFinite(data.price) || data.price <= 0 ||
                typeof data.category !== "string" || !data.category.trim()
            ) {
                return sendResponse(res, 400, {
                    message: "Please enter valid name, price and category"
                });
            }

            product.name = data.name.trim();
            product.price = data.price;
            product.category = data.category.trim();

            return sendResponse(res, 200, {
                message: "Product updated successfully",
                product: product
            });

        } catch (error) {
            return sendResponse(res, 400, {
                message: "Invalid JSON request body"
            });
        }
    }

    // DELETE: Delete a product
    if (method === "DELETE" && /^\/products\/\d+$/.test(path)) {
        const id = Number(path.split("/")[2]);
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            return sendResponse(res, 404, {
                message: "Product not found"
            });
        }

        const deletedProduct = products.splice(index, 1)[0];

        return sendResponse(res, 200, {
            message: "Product deleted successfully",
            product: deletedProduct
        });
    }

    // Invalid route
    return sendResponse(res, 404, {
        message: "Route not found"
    });
});

// Start server
const PORT = 3000;

server.listen(PORT, () => {
    console.log("==================================");
    console.log("PRODUCT INVENTORY SERVER STARTED");
    console.log("Server: http://localhost:3000");
    console.log("==================================");
});
