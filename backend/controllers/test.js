const test = async(req,res)=>{
    return res.status(200).json({message: "Testing Success"})
}

module.exports = test;