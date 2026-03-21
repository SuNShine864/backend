import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {upload} from "../middlewares/multer.middleware.js"

const generateAccessAndRefreshTokens = async(userId)=>{
    try{
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false}) 
        return {accessToken,refreshToken}
    }catch{
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    //get user input value from frontend
    //validation:- email should not be empty 
    //check if user already exists : check from username or email
    //check for images
    //avatar and coverimage should there
    //upload them to cloudinary, avatar check
    //create user object - create entry in db
    //remove password and refresh token field fro, response
    //check for user creation
    //return response
    const {fullName,email,username,password}=req.body //data from body, form se data (req.body ka access hame express de deta hai)

    // if(fullName===""){
    //     throw new ApiError(400,"fullname is required")
    // }    try if else if else if for begineers

    if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")//if one of the field given here is empti it will return true
    ){
        throw new ApiError(400,"All fields are required")
    }

    //check user already exists
    //the user defined in schema can call mongodb user any no of times
    const existedUser=await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

    //check for avatar images
    const avatarLocalPath=req.files?.avatar?.[0]?.path; //files ka access hame multer de deta hai
    //agar multer ne files store ki hogi , toh usme agr avatar ka field 0 hoga?(bcoz hamne ek hi file li h) toh uska path de do
    const coverImageLocalPath=req.files?.coverImage?.[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    //upload on cloudinary
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    //bcoz file ke size ke hisab se kitna bhi time lag skta h upload krne mein
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)


    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }
    //ab we are ready to make user object
    //we do it through user model
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

    //check ki user bna hai ya nhi
    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    ) //remove password

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    //we made user now we want to give response
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully ")
    )
})

const loginUser=asyncHandler(async(req,res)=>{
    //accept fields which you required to login
    //then check if user is registered or not
    //if not find give error
    //password check
    //refresh and access token
    //give token in cokkies

    const {username,email,password}=req.body;
    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }
    //find userin our database
    const user= await User.findOne({
        $or:[{username},{email}]
    })

    //if user not find
    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    //find password ye hmara method hai toh ham isse user mein use kr paenge , User mongodb ke methods rakhta hai
    const isPasswordValid = await user.isPasswordCorrect(password)
    
    //if password not correct
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }

    //access and refresh token
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
    
    //here user do not want to share password and refreshToken
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }     //these cookies can be modified by server only

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged In Successfully"
        )
    )

    const logoutUser=asyncHandler(async(req,res)=>{
        //remove cookies
        //change refreshtoken in user
        User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken:undefined
                }
            },
            {
                new:true
            }
        )
        const options={
            httpOnly:true,
            ecure:true
        } 
        return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User Logged Out"))
    })
})
export {registerUser,
    loginUser,
    logoutUser
}