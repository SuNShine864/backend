const asyncHandler =(requestHandler) =>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}
export {asyncHandler}



// const asyncHandler=()=>{} ek function
// const asyncHandler=(func) => {()=>{}} us function ko again kisi func mein paas kr diya 
// const asyncHandler=(fn)=>async()=>{} uske brackets remove kr diye or use async bna diya

// const asyncHandler=(fn)=>async(req,res,next)=>{
//     try{
//         await fn(req,res,next)
//     }catch(error){
//         res.status(error.code ||500).json({
//             success:false,
//             message:err.message
//         })
//     }
// }  // wrapper function for handling async/await 