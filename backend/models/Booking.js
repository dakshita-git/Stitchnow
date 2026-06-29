import mongoose from "mongoose";
const bookingSchema = new mongoose.Schema({
  customer:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}, boutique:{type:mongoose.Schema.Types.ObjectId,ref:"Boutique",required:true},
  service:{type:mongoose.Schema.Types.ObjectId,ref:"Service",required:true}, bookingDate:String, timeSlot:String,
  designImage:String, notes:String, measurements:{bust:String,waist:String,hip:String,shoulder:String,length:String},
  amount:Number, paymentStatus:{type:String,enum:["pending","paid"],default:"pending"},
  status:{type:String,enum:["Order Placed","Accepted","Design Confirmed","Cutting","Stitching","Trial Ready","Alteration","Ready","Out for Delivery","Delivered","Cancelled"],default:"Order Placed"}
},{timestamps:true});
export default mongoose.model("Booking", bookingSchema);
