// const asyncHandler=(requestHandler)=>{
//     return(res,req,next)=>{
//         Promise.resolve(requestHandler(res,req,next)).catch((error)=>{
//             next(error);
//         })
//     }
// }

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error)=>{
            next(error);
    });
}
};
export {asyncHandler}