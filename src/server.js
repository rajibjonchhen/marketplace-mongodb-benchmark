import express from "express";
import mongoose  from "mongoose";
import listEndpoints from 'express-list-endpoints'
import productsRouter from "./service/products/products.js";
import cors from 'cors'
import { badRequestHandler, genericErrorHandler, notFoundHandler, unauthorizedHandler } from "./service/handlers/errorHandler.js";
import usersRouter from "./service/users/users.js";
const {PORT = 3001} = process.env

const server = express()

server.use(cors())
server.use(express.json())

server.use("/products", productsRouter)
server.use("/users", usersRouter)


mongoose.connect(process.env.Mongo_Connection)
mongoose.connection.on("connected", () => {
    console.log("successfully connected to  mongo!")
})



server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

server.listen(PORT, () => {
    console.table(listEndpoints(server))
    console.log("The server is running in port", PORT)
})

server.on("error", (error) => {
    console.log("server has stopped  ",error)
})