// Import libraries
import express from "express"; 
import axios from "axios"; 
import cors from "cors"; 

const app = express(); // Initialize an Express application
app.use(cors()); //Enable CORS for all routes
app.use(express.json()); //Enable parsing of JSON payloads 

const shop = "anatta-test-store"; // Shopify store name
const accessToken = "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"; //Shopify API access token

// Shopify GraphQL API URL
const url = `https://${shop}.myshopify.com/admin/api/2024-07/graphql.json`;

// Headers for the Shopify API request
const headers = {
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": accessToken,
};

// Root route 
app.get("/", (req, res) => {
  return res.json({ data: "Hi, this is a response from the server." });
});

// Route to fetch products from Shopify
app.get("/products", async (req, res) => {
  const query1 = req.query.query; //Get the query parameter from the request

  try {
    // GraphQL query
    const query = `
      query {
        products(query: "${query1}", first: 1) {
          edges {
            node {
              id
              handle
              title
              variants(first: 250) {
                edges {
                  node {
                    id
                    price
                    title
                    displayName
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
          }
        }
        shop {
          name
          currencyCode
          currencyFormats {
            moneyFormat
          }
        }
      }
    `;
    const data = { query }; //Payload for the Axios POST request
    const response = await axios.post(url, data, { headers }); // Make the request to Shopify's GraphQL API
  
    // Extract and sort the products by price
    const products = response.data.data.products.edges.map((edge) => ({
      ...edge.node,
      variants: {
        edges: edge.node.variants.edges.sort(
          (a, b) => Number(a.node.price) - Number(b.node.price)
        ),
      },
    }));

    // Respond with the products and shop details
    return res.json({ products, shop: response.data.data.shop });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" }); 
  }
});

const port = 3010; //Define the port the server will listen on
app.listen(port, () => {
  console.log(`Server listening on port ${port}`); 
});
