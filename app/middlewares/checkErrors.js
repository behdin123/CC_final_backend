/**
 * This file exports two middleware functions for validating request data.
 * The first middleware function maps errors returned by Express Validator to an object and sends it as a response.
 * The second middleware function uses Yup to validate request data and sends an error response if validation fails.
 */

const { validationResult } = require("express-validator");


/**
 * maps errors returned by Express Validator to an object and sends it as a response.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - Express next middleware function
 * returns Object - Returns a response object with error messages
 */
function expressValidatorMapper(req, res, next) {
  let messages = {};

  const result = validationResult(req);
  messages = {}

  if (result?.errors?.length > 0) {
    
    result?.errors.forEach((err) => {
        messages[err.param] = err.msg;
    });

      return res.status(400).json({
          status : 400,
          success : false,
          messages
      });
  }

  next()
}


/**
 * Middleware function that uses Yup to validate request data and sends an error response if validation fails.
 * @param {Object} schema - Yup validation schema
 * returns function - Returns an Express middleware function
 */
const  yupValidator = (schema) => async (req, res, next) => {

  try {

    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } 
  
  catch (err) { 
    console.log(err)
    return res.status(500).json({ type: err.name, message: err.message });
  }

};

module.exports = {
  expressValidatorMapper,
  yupValidator
};
