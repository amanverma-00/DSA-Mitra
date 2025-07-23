const validator = require("validator");

const validate = (data)=>{
   
    const mandatoryField = ['username',"email",'password'];

    const IsAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k));

    if(!IsAllowed)
        throw new Error("Some Field Missing")

    if(!validator.isEmail(data.email))
        throw new Error("Invalid Email")

    if(!validator.isStrongPassword(data.password))
        throw new Error("Password is too weak (must be at least 8 chars, include uppercase, lowercase, number, symbol)");
}

module.exports = validate;