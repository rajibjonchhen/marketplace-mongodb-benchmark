
   
import mongoose from "mongoose"

const { Schema, model } = mongoose

const CartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, required: true, enum: ["active", "paid"] },
    products: [
      { _id: String, 
        name: String, 
        price: Number, 
        quantity: Number },
    ],
  },
  { timestamps: true }
)

export default model("Cart", CartSchema)