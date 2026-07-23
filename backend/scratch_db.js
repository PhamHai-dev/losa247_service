const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb+srv://losa247_admin:losa247@cluster0.wmmqfae.mongodb.net/losa247?appName=Cluster0');
  const pricingplans = await mongoose.connection.db.collection('pricingplans').find({}).toArray();
  const pricingPlans = await mongoose.connection.db.collection('pricingPlans').find({}).toArray();
  const services = await mongoose.connection.db.collection('services').find({}).toArray();
  
  console.log("pricingplans:", JSON.stringify(pricingplans, null, 2));
  console.log("pricingPlans:", JSON.stringify(pricingPlans, null, 2));
  console.log("services count:", services.length);
  process.exit(0);
}

run();
