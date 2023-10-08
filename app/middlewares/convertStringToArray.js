/**
 * This function exports a middleware that adds a string value to an array.
*/

/**
 * @param {string} field - The name of the field in the request body to modify
 * returns function - A middleware function that modifies the request body
*/
module.exports.addStrToArr = (field) => {

    return function (req, res, next) {

        // If the request body field is a string, it wraps it in an array

        if (typeof req.body[field] == "string") {
            req.body[field] = [req.body[field]]
        } 

        // If the request body field is not defined, it sets it to an empty array

        else if(!req.body[field]) {
            req.body[field] = []
        }

        next()
    }
}