import express, {Router} from 'express'
import CartModel from './cart-model.js'
import productModel from '../products/product-model.js'
import createHttpError from 'http-errors'

const cartsRouter = Router()

/******************** insert a product in specific user's cart ********************/ 
cartsRouter.post("/:userId", async(req, res, next) => { 
try {
    const {_id, quantity} = req.body
    const purchasedProduct = await productModel.findById(_id)
    if(purchasedProduct){
        const isProductThere = await CartModel.findOne({
            userId : req.params.userId,
            "products._id" : _id, 
            status : "active"
        })

        if(isProductThere){
            const updatedCart = await CartModel.findOneAndUpdate({
                userId: req.params.userId,
                status: "active",
                "products._id" : purchasedProduct._id
            }, {$inc : {"products.$.quantity" : quantity}},
            {new: true}
            )
            res.send(updatedCart)
        } else {
            const productToInsert = {...purchasedProduct.toObject(), quantity}
            const modifiedCart = await CartModel.findOneAndUpdate({userId: req.params.userId, status: "active"},
            {$push: {products: productToInsert}},
            {new: true,
            upsert: true
        }
        )
        res.send(modifiedCart)
        }
    }else {
        next(createHttpError(404, `Product with id ${productId} not found`))
    }
} catch (error) {
    next(error)
}})

/******************** get all the product from specific user's cart ********************/ 
cartsRouter.get("/:userId", async(req, res, next) => { 
    try {
        const cart = await CartModel.findOne({
            userId : req.params.userId,
            status: "active"
        })
        res.send(cart)

    } catch (error) {
        next(error)
    }})
export default cartsRouter