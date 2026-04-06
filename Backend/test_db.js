const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/pawan/Desktop/CodeMaze/Backend/.env' });
const Experience = require('/Users/pawan/Desktop/CodeMaze/Backend/models/experience.model');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const exps = await Experience.find().sort({ createdAt: -1 }).limit(1);
    console.log(JSON.stringify(exps[0], null, 2));
    process.exit(0);
  });
