import express, { Router } from "express";
import createError from "http-errors";
import UserModel from "./user-model.js";
import q2m from "query-to-mongo";
import {v2 as cloudinary} from 'cloudinary'
import {CloudinaryStorage} from 'multer-storage-cloudinary'
import multer from "multer";

const usersRouter = Router();


const cloudinaryUploader = multer({
        storage: new CloudinaryStorage({
        cloudinary,
          params:{
            folder:'user'
          }
        })
      }).single("image")

/************************* post new user*********************************/
usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body)
    const { _id } = await newUser.save();
    res.status(201).send({ _id: _id });
  } catch (error) {
    next(error);
  }
});

/*************************** get all the user*******************************/
usersRouter.get("/", async (req, res, next) => {
  try {
      const defaultQuery = {
          sort:"-createdAt",
          skip:0,
          limit:20,
      }

    const query = {...defaultQuery,...req.query}
    const mongoQuery = q2m(query);
    const total = await UserModel.countDocuments(mongoQuery.criteria);

      const users = await UserModel
        .find(mongoQuery.criteria)
        .sort(mongoQuery.options.sort)
        .skip(mongoQuery.options.skip)
        .limit(mongoQuery.options.limit)
      res.status(200).send({
        links: mongoQuery.links("/users", total),
        total,
        totalPages: Math.ceil(total / mongoQuery.options.limit),
        users
      });
   
  } catch (error) {
    next(error);
  }
});

/****************************** get specific user****************************/

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await UserModel.findById(userId)
    res.status(200).send(user);

    if (true) {
    } else {
      next(createError(404, "could not find the specific "));
    }
  } catch (error) {
    next(error);
  }
});

/***************************** update specific user*****************************/

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const updatedUser = await UserModel.findByIdAndUpdate(userId, req.body, {
      new: true,
    });
    if (updatedUser) {
      res.status(200).send(updatedUser);
    } else {
      next(createError(404, "could not find the specific "));
    }
  } catch (error) {
    next(error);
  }
});


/***************************** update  cover image specific user*****************************/

usersRouter.put("/:userId/avatar",cloudinaryUploader, async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const updatedUser = await UserModel.findByIdAndUpdate(
          userId, 
        {cover:req.file.path}, {
        new: true,
      });
      if (updatedUser) {
          console.log(updatedUser)
        res.status(200).send(updatedUser);
      } else {
        next(createError(404, "could not find the specific "));
      }
    } catch (error) {
      next(error);
    }
  });


/**************************** delete specific user******************************/

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const deletedUser = await UserModel.findByIdAndDelete(userId);
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(
        createError(404, "could not find the specific User with id", userId)
      );
    }
  } catch (error) {
    next(error);
  }
});


export default usersRouter;
