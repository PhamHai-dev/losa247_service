const mongoose = require('mongoose');
const PricingPlan = require('./models/PricingPlan.model');

async function run() {
  await mongoose.connect('mongodb+srv://losa247_admin:losa247@cluster0.wmmqfae.mongodb.net/losa247?appName=Cluster0');
  const items = await PricingPlan.find();
  console.log("Found:", JSON.stringify(items, null, 2));
  process.exit(0);
}
run();
