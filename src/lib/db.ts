import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI. Add it to your environment.");
}

declare global {
  var mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const globalConn = global.mongooseConn ?? { conn: null, promise: null };

export async function connectDb() {
  if (globalConn.conn) return globalConn.conn;
  if (!globalConn.promise) {
    globalConn.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }
  globalConn.conn = await globalConn.promise;
  global.mongooseConn = globalConn;
  return globalConn.conn;
}
