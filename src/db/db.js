const { MongoClient } = require("mongodb");

const mongo_uri = process.env.MONGO_URI;
const client = new MongoClient(mongo_uri);
const dbName = "facebook_post_publishing_db";

try {
    client.connect();
} catch (error) {
    console.log("error connecting db...",error);
}

const dbClient = client.db(dbName);

module.exports = dbClient;