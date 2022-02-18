import mongoose from "mongoose";


const { Schema, model } = mongoose
const productSchema = new Schema({
        "name": {type:String, required:true},
        "description": {type:String, required:true},
	    "category": {type:String, required:true},
	    "brand": {type:String, required:true},
	    "imageUrl":{type:String},
	    "price": {type: Number,required : true},
		"reviews": [{
			comment:String,
			rate: Number
		}],
    },
    {
        timestamps: true,
      }          
)

export default model("Product", productSchema )