import mongoose from "mongoose";
const serviceSchema = new mongoose.Schema({
  boutique:{type:mongoose.Schema.Types.ObjectId,ref:"Boutique",required:true},
  name:{type:String,required:true}, category:String, price:{type:Number,required:true}, urgentPrice:Number, deliveryDays:{type:Number,default:3}, description:String
},{timestamps:true});
export default mongoose.model("Service", serviceSchema);
