"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const _ = require("lodash");
const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017", {
  useUnifiedTopology: true,
});

const { simulateProblems } = require("./helpers.js");
const PORT = 4000;

express()
  .use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Methods",
      "OPTIONS, HEAD, GET, PUT, POST, DELETE"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  })
  .use(morgan("tiny"))
  .use(express.static("./server/assets"))
  .use(bodyParser.json())
  .use(express.urlencoded({ extended: false }))
  .use("/", express.static(__dirname + "/"))

  // REST endpoints

  //---Gets Country List in an Array---//

  .get("/countries", async (req, res) => {
    try {
      await client.connect();
      const db = client.db("dragon");
      const companyData = await db.collection("companies").find().toArray();
      const countryList = companyData.map((country) => {
        return country.country;
      });
      const uniqueCountries = Array.from(new Set(countryList));
      return res.json({ countries: uniqueCountries });
    } catch (e) {
      res.status(500).json({ status: 500, message: e.message });
    }
  })

  //DO NOT USE THIS ENDPOINT.... YET. Could be used for a company page...

  .get("/companies/:country", async (req, res) => {
    const { country } = req.params;
    try {
      const companiesByCountry = companyData.filter((company) => {
        return (
          company.country.replace(" ", "").toLowerCase() ===
          country.toLowerCase()
        );
      });
      return simulateProblems(res, { companies: companiesByCountry });
    } catch (e) {
      return simulateProblems(res, { error: e });
    }
  })

  //----Gets the Products by each country----//
  .get("/products/:country", async (req, res) => {
    const { country } = req.params;

    try {
      await client.connect();
      const db = client.db("dragon");
      const companyData = await db.collection("companies").find().toArray();
      const productData = await db.collection("items").find().toArray();
      const countryList = companyData.map((country) => {
        return country.country.toLowerCase();
      });
      const uniqueCountries = Array.from(new Set(countryList));
      if (uniqueCountries.includes(country.toLowerCase())) {
        const companiesIdByCountry = companyData
          .map((company) => {
            if (
              company.country.replace(" ", "").toLowerCase() ===
              country.replace(" ", "").toLowerCase()
            ) {
              return company._id;
            }
          })
          .filter((id) => id !== undefined);
        const productsByCountry = companiesIdByCountry.map((id) => {
          return productData.filter((product) => {
            return product.companyId === id;
          });
        });
        return simulateProblems(res, {
          products: _.flatten(productsByCountry),
        });
      }
    } catch (e) {
      res.status(404).send({
        error: `We either don't sell in that country or we couldn't find what you're looking for.`,
      });
    }
  })

  .get("/products/detail/:productId", async (req, res) => {
    const { productId } = req.params;
    try {
      await client.connect();
      const db = client.db("dragon");
      const productData = await db.collection("items").find().toArray();
      const product = productData.find(
        (product) => product._id === parseInt(productId)
      );
      if (product) {
        return simulateProblems(res, { product });
      }
    } catch (e) {
      return simulateProblems(res, { message: "Product not found.", e });
    }
  })

  //---A countries Featured Products, Sorted By Lowest Price---//

  .get("/countries/:country/featuredproducts", async (req, res) => {
    const { country } = req.params;
    try {
      await client.connect();
      const db = client.db("dragon");
      const companyData = await db.collection("companies").find().toArray();
      const productData = await db.collection("items").find().toArray();
      const companiesIdByCountry = companyData
        .map((company) => {
          if (
            company.country.replace(" ", "").toLowerCase() ===
            country.toLowerCase()
          ) {
            return company._id;
          }
        })
        .filter((id) => id !== undefined);
      const productsByCountry = companiesIdByCountry.map((id) => {
        return productData.filter((product) => {
          return product.companyId === id;
        });
      });
      const lowestPrices = _.flatten(productsByCountry).filter((product) => {
        if (product.numInStock > 0) {
          let newPrice = product.price.slice(1);
          return parseFloat(newPrice) < 20;
        }
      });
      return simulateProblems(res, { features: lowestPrices });
    } catch (e) {
      res.status(500).send({
        error: e,
      });
    }
  })

  //Order-Form Validation

  .post("/order", async (req, res) => {
    const { order_summary } = req.body;
    if (!order_summary.length) {
      return res.status(400).send({ message: "Failure" });
    }
    try {
      await client.connect();
      const db = client.db("dragon");
      const productData = await db.collection("items").find().toArray();
      const isOrderSuccessful = _.flatten(order_summary).map((item) => {
        if (!item.item_id || !item.quantity) {
          return false;
        }
        return productData
          .filter((product) => {
            product._id === item.item_id;
          })
          .map((orderItem) => {
            if (orderItem.numInStock - item.quantity >= 0) {
              orderItem.numInStock -= item.quantity;
              return true;
            } else if (orderItem.numInStock - item.quantity <= 0) {
              return false;
            }
          });
      });
      if (!_.flatten(isOrderSuccessful).includes(false)) {
        await db.collection("orders").insertOne({ order_summary });
        return res.status(200).send({ message: "Successful Purchase!" });
      }
    } catch (e) {
      return res.status(400).send({ message: "Failure" });
    }
  })

  //---Gets Categories, Organized by Country---//

  .get("/categories/:country", async (req, res) => {
    const { country } = req.params;
    try {
      await client.connect();
      const db = client.db("dragon");
      const companyData = await db.collection("companies").find().toArray();
      const productData = await db.collection("items").find().toArray();
      const companiesIdByCountry = companyData
        .map((company) => {
          if (
            company.country.replace(" ", "").toLowerCase() ===
            country.toLowerCase()
          ) {
            return company.id;
          }
        })
        .filter((id) => id !== undefined);
      const productsByCountry = companiesIdByCountry.map((id) => {
        return productData.filter((product) => {
          return product.companyId === id;
        });
      });
      const productsByCategories = _.flatten(productsByCountry).map(
        (product) => {
          return product.category;
        }
      );
      return simulateProblems(res, {
        categories: Array.from(new Set(productsByCategories)),
      });
    } catch (e) {
      res.send(500).json(e);
    }
  })

  .listen(PORT, () => console.info(`Listening on port ${PORT}`));
