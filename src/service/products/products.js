import express, { Router } from "express";
import createError from "http-errors";
import ProductModel from "./product-model.js";
import q2m from "query-to-mongo";
import {v2 as cloudinary} from 'cloudinary'
import {CloudinaryStorage} from 'multer-storage-cloudinary'
import multer from "multer";

const productsRouter = Router();


const cloudinaryUploader = multer({
        storage: new CloudinaryStorage({
        cloudinary,
          params:{
            folder:'product'
          }
        })
      }).single("image")

/************************* post new *********************************/
productsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new ProductModel(req.body)
    const { _id } = await newProduct.save();
    res.status(201).send({ _id: _id });
  } catch (error) {
    next(error);
  }
});

/*************************** get all the *******************************/
productsRouter.get("/", async (req, res, next) => {
  try {
      const defaultQuery = {
          sort:"-createdAt",
          skip:0,
          limit:20,
      }

    const query = {...defaultQuery,...req.query}
    const mongoQuery = q2m(query);
    const total = await ProductModel.countDocuments(mongoQuery.criteria);

      const products = await ProductModel
        .find(mongoQuery.criteria)
        .sort(mongoQuery.options.sort)
        .skip(mongoQuery.options.skip)
        .limit(mongoQuery.options.limit)
      res.status(200).send({
        links: mongoQuery.links("/productss", total),
        total,
        totalPages: Math.ceil(total / mongoQuery.options.limit),
        products
      });
   
  } catch (error) {
    next(error);
  }
});

/****************************** get specific product****************************/

productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const product = await ProductModel.findById(productId)
    res.status(200).send(product);

    if (true) {
    } else {
      next(createError(404, "could not find the specific "));
    }
  } catch (error) {
    next(error);
  }
});

/***************************** update specific *****************************/

productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const updatedProduct = await ProductModel.findByIdAndUpdate(productId, req.body, {
      new: true,
    });
    if (updatedProduct) {
      res.status(200).send(updatedProduct);
    } else {
      next(createError(404, "could not find the specific "));
    }
  } catch (error) {
    next(error);
  }
});

/***************************** update the like of specific Product post *****************************/

productsRouter.put("/:productId/likes", async (req, res, next) => {
  try {
    const reqProduct = await ProductModel.findByIdAndUpdate(req.params.productId);
    if (reqProduct) {
   
      const index = reqProduct.likes.findIndex(
        (id) => id.toString() === req.body._id
        );
      if (index === -1) {
        reqProduct.likes.push(req.body._id)
        await reqProduct.save();
        res.send(reqProduct);
      } else {
        reqProduct.likes = reqProduct.likes.filter(id => id.toString() !== req.body._id)
        console.log("reqProduct like removed",reqProduct)
        await reqProduct.save();
        res.send(reqProduct);

      }
    } else {
      next(
        createError(
          404,
          "could not find the specific Product with id",
          req.params.productId
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

/***************************** update  cover image specific *****************************/

productsRouter.put("/:productId/cover",cloudinaryUploader, async (req, res, next) => {
    try {
      const productId = req.params.productId;
      const updatedProduct = await ProductModel.findByIdAndUpdate(
          productId, 
        {cover:req.file.path}, {
        new: true,
      });
      if (updatedProduct) {
          console.log(updatedProduct)
        res.status(200).send(updatedProduct);
      } else {
        next(createError(404, "could not find the specific "));
      }
    } catch (error) {
      next(error);
    }
  });


/**************************** delete specific ******************************/

productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const deletedProduct = await ProductModel.findByIdAndDelete(productId);
    if (deletedProduct) {
      res.status(204).send();
    } else {
      next(
        createError(404, "could not find the specific Product with id", productId)
      );
    }
  } catch (error) {
    next(error);
  }
});

/**************************** add review to specific Product ******************************/
productsRouter.post("/:productId/reviews", async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const newReview = { ...req.body };
    const product = await ProductModel.findById(productId);
    if (product) {
      const modifiedProduct = await ProductModel.findByIdAndUpdate(
        productId,
        { $push: { reviews: newReview } },
        { new: true }
      );
      res.status(201).send(modifiedProduct);
    } else {
      next(
        createError(404, "could not find the specific product with id", productId)
      );
    }
  } catch (error) {
    next(error);
  }
});

/**************************** get all reviews to specific product ******************************/
productsRouter.get("/:productId/reviews", async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const product = await ProductModel.findById(productId);
    if (product) {
      res.status(200).send(product.reviews);
    } else {
      next(
        createError(404, "could not find the specific product with id", productId)
      );
    }
  } catch (error) {
    next(error);
  }
});

/**************************** get specific review from specific product ******************************/
productsRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.productId);
    if (product) {
      const reqReview = product.reviews.find(
        (review) => review._id.toString() === req.params.reviewId
      );
      if (reqReview) {
        res.status(200).send(reqReview);
      } else {
        next(
          createError(
            404,
            "could not find the specific review with id",
            req.params.reviewId
          )
        );
      }
    } else {
      next(
        createError(
          404,
          "could not find the specific product with id",
          req.params.productId
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

/**************************** delete specific review from specific product ******************************/
productsRouter.delete("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const modifiedProduct = await ProductModel.findByIdAndUpdate(
      req.params.productId,
      { $pull: { reviews: { _id: req.params.reviewId } } },
      { new: true }
    );

    if (modifiedProduct) {
      res.send(modifiedProduct);
    } else {
      next(
        createError(
          404,
          "could not find the specific product with id",
          req.params.productId
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

/**************************** edit specific review from specific product ******************************/
productsRouter.put("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const reqProduct = await ProductModel.findByIdAndUpdate(req.params.productId);

    if (reqProduct) {
      const index = reqProduct.reviews.findIndex(
        (review) => review._id.toString() === req.params.reviewId
      );
      if (index !== -1) {
        reqProduct.reviews[index] = {
          ...reqProduct.reviews[index].toObject(),
          ...req.body,
        };
        await reqProduct.save();
        res.send(reqProduct);
      } else {
        next(
          createError(
            404,
            "could not find the specific product with id",
            req.params.productId
          )
        );
      }
    } else {
      next(
        createError(
          404,
          "could not find the specific product with id",
          req.params.productId
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
export default productsRouter;
