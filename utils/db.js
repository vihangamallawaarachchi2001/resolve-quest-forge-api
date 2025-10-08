import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()
const uri = process.env.MONGODB_URI;

export default async function dbConnection(){
  await mongoose.connect(uri)
    .then(()=>{
      console.log('connection success');
    })
    .catch((error) => {
      console.log(error);
    })
}