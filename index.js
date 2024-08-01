import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const shop = "anatta-test-store";
const accessToken = "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";

const url = `https://${shop}.myshopify.com/admin/api/2024-07/graphql.json`;
const headers = {
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": accessToken,
};

app.get("/products", async (req, res) => {
  const query1 = req.query.query;

  console.log(query1);
  try {
    const query = `
      query {
        products(query:"${query1}",first: 1) {
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
      }
    `;
    const data = { query };
    const response = await axios.post(url, data, { headers });
    const products = response.data.data.products.edges.map((edge) => ({
      ...edge.node,
      variants: {
        edges: edge.node.variants.edges.sort(
          (a, b) => Number(a.node.price) - Number(b.node.price)
        ),
      },
    }));
    return res.json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

const port = 3010;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
