import mongoose from "mongoose";


const { Schema, model } = mongoose
const userSchema = new Schema({
        "name": {type:String, required:true},
        "email": {type:String, required:true},
	    "avatar":{type:String},
        "cart":[{type : Schema.Types.ObjectId, ref:"Product"}],
    },
    {
        timestamps: true,
      }          
)

export default model("User", userSchema )