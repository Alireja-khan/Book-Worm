import { connect } from "mongoose"

const mongodbUrl=process.env.MONGODB_URL!
if(!mongodbUrl){
console.log("mongo db not found")
}

let cached=global.mongoose

if(!cached){
    cached=global.mongoose={conn:null,promise:null}
}

const connectDb=async ()=>{
if(cached.conn){
    console.log("cached db connected")
    return cached.conn
}

if(!cached.promise){
    cached.promise = connect(mongodbUrl).then((c)=>c.connection)
}

try {
    cached.conn=await cached.promise
    console.log("db connected")
} catch (error) {
    throw error
}

return cached.conn
}

export default connectDb