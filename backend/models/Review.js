import mongoose from "mongoose";
const reviewSchema = new mongoose.Schema({
  customer:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}, boutique:{type:mongoose.Schema.Types.ObjectId,ref:"Boutique",required:true}, rating:{type:Number,min:1,max:5,required:true}, comment:String, image:String
},{timestamps:true});
export default mongoose.model("Review", reviewSchema);
