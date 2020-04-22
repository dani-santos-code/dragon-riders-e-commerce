const fs = require("file-system");
const { MongoClient } = require("mongodb");
const assert = require("assert");
const items = JSON.parse(fs.readFileSync("data/fixedItems.json"));
const companies = JSON.parse(fs.readFileSync("data/fixedCompanies.json"));

const client = new MongoClient("mongodb://localhost:27017", {
  useUnifiedTopology: true,
});

const batchImport = async () => {
  try {
    await client.connect();
    const db = client.db("dragon");
    const r1 = await db.collection("items").insertMany(items);
    assert.strictEqual(Object.keys(items).length, r1.insertedCount);
    const r2 = await db.collection("companies").insertMany(companies);
    assert.strictEqual(Object.keys(companies).length, r2.insertedCount);
  } catch (e) {
    console.log(e.stack);
  }
};

batchImport().then(() => {
  console.log("Data successfully inserted.");
  client.close();
  return;
});
