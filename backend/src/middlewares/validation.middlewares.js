import joi from "joi"




//registation validation
const registrationValidation = (req, res, next) => {
    const schema = joi.object({
        name: joi.string()
            .min(3)
            .max(30)
            .required()
            .messages({
                "string.empty": "Name cannot be empty",
                "string.min": "Name must be at least 3 characters",
                "string.max": "Name cannot be longer than 30 characters"
            }),
        email: joi.string()
            .email()
            .required()
            .messages({
                "string.email": "Invalid email format",
                "string.empty": "Email can not be empty"
            }),
        password: joi.string()
            .min(5)
            .max(10)
            .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,10}$/)
            .required()
            .messages({
                "string.empty": "Password cannot be empty",
                "string.min": "Password must be at least 5 characters",
                "string.max": "Password cannot longer than 10 characters",
                "string.pattern.base": "Password must include at least one uppercase letter, one number,and one special character"
            }),
        contactNo: joi.string()
            .pattern(/^\d{10}$/)
            .required()
            .messages({
                "string.empty": "ContactNo cannot be empty",
                "string.pattern.base": "Contact number must contain only 10 digits"
            }),
        address: joi.string()
            .min(5)
            .max(100)
            .required(),
    })

    const { error } = schema.validate(req.body, { abortEarly: false })
    if (error) {
        return res.status(400)
            .json({ message: "bad request", error })
    }
    next()
}


//login validation
const loginValidation = (req, res, next) => {
    const schema = joi.object({
        name: joi.string()
            .min(3)
            .max(30)
            .optional()
            .messages({
                "string.empty": "Name cannot be empty",
                "string.min": "Name must be at least 3 characters",
                "string.max": "Name cannot be longer than 30 characters"
            }),
        email: joi.string()
            .email()
            .optional()
            .messages({
                "string.email": "Invalid email format",
                "string.empty": "Email can not be empty"
            }),
        contactNo: joi.string()
            .pattern(/^\d{10}$/)
            .optional()
            .messages({
                "string.empty": "ContactNo cannot be empty",
                "string.pattern.base": "Contact number must contain only 10 digits"
            }),
        password: joi.string()
            .min(5)
            .max(10)
            .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,10}$/)
            .required()
            .messages({
                "string.empty": "Password cannot be empty",
                "string.min": "Password must be at least 5 character",
                "string.max": "Password cannot longer than 10 character",
                "string.pattern.base": "Password must include at least one uppercase letter, one number,and one special character"
            }),
    }).or('email', 'name', 'contactNo')

    const { error } = schema.validate(req.body, { abortEarly: false })
    if (error) {
        return res.status(400)
            .json({ message: "bad request", error })
    }
    next()
}



export { registrationValidation, loginValidation }