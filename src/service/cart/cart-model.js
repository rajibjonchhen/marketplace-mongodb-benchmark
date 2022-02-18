
   
import mongoose from "mongoose"

const { Schema, model } = mongoose

const CartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, required: true, enum: ["active", "paid"] },
    products: [
      { product_id: String, title: String, price: Number, quantity: Number },
    ],
  },
  { timestamps: true }
)

export default model("Cart", CartSchema)