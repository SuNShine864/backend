import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=new Schema({
    videoFile:{
        type:String, //cloudnary url
        required:true
    },
    thumbnail:{
        type:String, //cloudnary url
        required:true
    },
    title:{
        type:String,
        required:true
    },
    duration:{
        type:Number, //cloudnary file information 
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    }
},{timetamps:true});
videoSchema.plugin(mongooseAggregatePaginate)  //plug-ins middleware 
export const Video=mongoose.model("Video",videoSchema)