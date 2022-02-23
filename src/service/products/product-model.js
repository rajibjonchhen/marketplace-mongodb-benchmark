import mongoose from "mongoose";


const { Schema, model } = mongoose
const productSchema = new Schema({
        "name": {type:String, required:true},
        "description": {type:String, required:true},
	    "category": {type:String, required:true},
	    "brand": {type:String, required:true},
	    "imageUrl":{type:String},
		"productRating":{type:Number},
	    "price": {type: Number,required : true},
		"reviews": [{
			comment:String,
			rate: {type:Number, min:1, max:5}
		}],
    },
    {
        timestamps: true,
      }          
)

export default model("Product", productSchema )