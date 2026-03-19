import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()
app.use(cors({
    origin:process.env.CORS_ORIGIN, // frontend ki kaha se request aa rhi hai
    credentials:true
}))
app.use(express.json({limit:"16kb"}))   //allowing json files
app.use(express.urlencoded({extended:true,limit:"16kb"}))  // we need to tell ki url se bhi data aa skta hai, eg we need search qutub minor in google that data will be given in url format
// extended means object ke ander objects 
app.use(express.static("public"))  //jo data aaega like pdf, images ham unhe apne paas store rakhna chahte hai
app.use(cookieParser())

//routes

import userRouter from './routes/user.route.js'


//routes declaration
app.use("/api/v1/users",userRouter)
//whenever user goes to /users we will give its control to userRouter then go to user.route.js  
// http://localhost:8000/api/v1/users/register
export {app}