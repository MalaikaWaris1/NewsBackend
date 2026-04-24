const validateText = (req, res, next) => {
    const { text } = req.body;

    if (!text || text.trim() === "") {
        return  res.status(400).json({
            success: false,
            message: "text is required"
        });
    }
    if (text.length > 3000) {
        return res.status(400).json({
            success: false,
            message: "3000 charecters text required"
        })
    }
    next();
}
export default validateText;