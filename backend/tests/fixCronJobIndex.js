import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import CronJob from '../models/CronJob.js';

dotenv.config();

// Script to fix the cronId index issue
async function fixCronJobIndex() {
  try {
    // Connect to database
    await mongoose.connect(process.env.URI);
    console.log('✅ Connected to database');

    // Check existing indexes
    const indexes = await CronJob.collection.getIndexes();
    console.log('📋 Current indexes:', Object.keys(indexes));

    // Drop the problematic cronId index if it exists
    if (indexes.cronId_1) {
      console.log('🗑️ Dropping old cronId_1 index...');
      await CronJob.collection.dropIndex('cronId_1');
      console.log('✅ Successfully dropped cronId_1 index');
    } else {
      console.log('✅ cronId_1 index not found (good!)');
    }

    // Check if there are any documents with cronId field
    const docsWithCronId = await CronJob.find({ cronId: { $exists: true } });
    if (docsWithCronId.length > 0) {
      console.log(`🔄 Found ${docsWithCronId.length} documents with cronId field. Removing field...`);
      
      await CronJob.updateMany(
        { cronId: { $exists: true } },
        { $unset: { cronId: "" } }
      );
      
      console.log('✅ Removed cronId field from all documents');
    } else {
      console.log('✅ No documents with cronId field found');
    }

    // Show final indexes
    const finalIndexes = await CronJob.collection.getIndexes();
    console.log('📋 Final indexes:', Object.keys(finalIndexes));

    console.log('\n✅ Index fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

fixCronJobIndex();
