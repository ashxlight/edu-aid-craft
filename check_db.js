import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const docs = await mongoose.connection.collection('documents').find().toArray();
    console.log('DOCS:', docs.map(d => ({ title: d.title, textLength: d.content ? d.content.length : 'UNDEFINED' })));
    process.exit(0);
});
