import { connect } from "mongoose";
import '@/model/Genre.model';
import '@/model/Book.model';
import '@/model/ReadingLog.model';
import '@/model/Review.model';
import '@/model/user.model';
import '@/model/Activity.model';

const mongodbUrl=process.env.MONGODB_URL!
if(!mongodbUrl){
console.log("mongo db not found")
}

import { Connection } from 'mongoose';

declare global {
  var mongoose: { conn: Connection | null; promise: Promise<Connection> | null; };
}

let cached = global.mongoose;

if(!cached){
    cached=global.mongoose={conn:null,promise:null};
}

const connectDb=async ()=>{
if(cached.conn){
    console.log("cached db connected")
    return cached.conn
}

if(!cached.promise){
    const connectionOptions = {
      bufferCommands: false,
      bufferMaxEntries: 0,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 30000,
      retryWrites: true,
    };
    cached.promise = connect(mongodbUrl, connectionOptions).then(mongoose => mongoose.connection);
}

try {
    const connection = await cached.promise;
    cached.conn = connection;
    console.log("db connected");
} catch (error) {
    console.error('Database connection error:', error);
    throw error;
}

return cached.conn
}

export default connectDb