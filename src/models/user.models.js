import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema=new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true  //searching key enable krne ke liye use aaega
        },
        email:{
            type: String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,   
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true  //searching key enable krne ke liye use aaega
        },
        avatar:{
            type: String, //cloudnary url (images or video store krke url de deta hai)
            required:true,
        },
        coverImage:{
            type: String, //cloudnary url (images or video store krke url de deta hai)
        },
        watchHistory:[  //array of objects bcoz ek person bohot sare video dekh skta hai
            {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
            },
        ],
        password:{
            type:String, 
            required:[true,'Password is required']
        },
        refreshToken:{
            type:String,
        }
    },{
    timestamps:true
})
// userSchema.pre("save",()=>{})  // we cannot write like this bcoz arrow function mein this ka use nhi hota , use context nhi pta hota
userSchema.pre("save",async function (){
    if(!this.isModified("password")){
        return ;
    }
    this.password = await bcrypt.hash(this.password,10) //salt or hashrounds
    //problem jab bhi userschema use hoga ye har baar pssword save krta jaega chahe if avatar save hua ho 
    //we only need when there is change in password
})
// hamne ab jo password save kia wo encrypted save kia but we need to check user typed password with this during login
//we do it using methods
userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
} // we write here our customised password method

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}




export const User=mongoose.model("User",userSchema)