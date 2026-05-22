const { MongoClient } = require('mongodb');

// Your old database URL (Railway)
const SOURCE_URI = "mongodb://mongo:IjbiheKRPesVJMSnyDNPdpEeyXiXWSmL@maglev.proxy.rlwy.net:27716";

// Your new database URL (Dokploy Internal)
// (This reads from the environment variable we just set up!)
const TARGET_URI = process.env.MONGODB_URI; 

async function migrateData() {
  console.log("Starting database migration...");
  
  if (!TARGET_URI) {
    console.error("❌ ERROR: MONGODB_URI is not set. Please run this inside the Dokploy terminal where the environment is loaded.");
    process.exit(1);
  }

  let sourceClient;
  let targetClient;

  try {
    // Connect to both databases
    console.log("Connecting to old Railway database...");
    sourceClient = await MongoClient.connect(SOURCE_URI);
    // Railway usually stores data in a database named 'test' by default if not specified
    const sourceDb = sourceClient.db('test'); 

    console.log("Connecting to new Dokploy database...");
    targetClient = await MongoClient.connect(TARGET_URI);
    const targetDb = targetClient.db('arcpay');

    // Collections to migrate
    const collections = ['admins', 'settings', 'links'];

    for (const collName of collections) {
      console.log(`\n--- Migrating collection: ${collName} ---`);
      
      const sourceCollection = sourceDb.collection(collName);
      const targetCollection = targetDb.collection(collName);

      // Fetch all documents from source
      const docs = await sourceCollection.find({}).toArray();
      console.log(`Found ${docs.length} documents in old database.`);

      if (docs.length > 0) {
        // Clear target collection first to avoid duplicates
        await targetCollection.deleteMany({});
        console.log(`Cleared existing data in new collection.`);

        // Insert into target
        await targetCollection.insertMany(docs);
        console.log(`✅ Successfully migrated ${docs.length} documents to new database.`);
      } else {
        console.log(`Skipping. No data found for ${collName}.`);
      }
    }

    console.log("\n🎉 MIGRATION COMPLETE! Your new database is ready to go.");

  } catch (error) {
    console.error("\n❌ MIGRATION FAILED:");
    console.error(error);
  } finally {
    if (sourceClient) await sourceClient.close();
    if (targetClient) await targetClient.close();
    process.exit(0);
  }
}

migrateData();
