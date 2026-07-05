require('dotenv').config();
require('./dbs/init');

const { importDB } = require('./dbs/importDB');

setTimeout(async () => {
  try {
    await importDB();
    console.log('Seed completed!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}, 3000);
