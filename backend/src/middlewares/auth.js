const { z } = require("zod");
const jwt = require("jsonwebtoken");
const {
  BadRequestError,
  Unauthorized,
  Forbidden,
} = require("../utils/request");
const userRepository = require("../repositories/users");
const { successResponse } = require("../utils/response");
exports.authorization =
  (...roles) =>
  async (req, res, next) => {
    // get token from request headers
    const authorizationHeader = req.headers["authorization"];
    if (!authorizationHeader) {
      throw new Unauthorized("You need to login in advance!");
    }

    const splittedAuthHeader = authorizationHeader.split(" ");
    if (splittedAuthHeader.length <= 1) {
      throw new Unauthorized("Token is not valid!");
    }

    const token = splittedAuthHeader[1];

    // extract the token
    const extractedToken = jwt.verify(token, process.env.JWT_SECRET);

    // get information of the user that has that token
    const user = await userRepository.getUserById(extractedToken.user_id);

    // validate the role that can be access to the next middleware
    const accessValidation = roles.includes(user.role_id);
    if (!accessValidation) {
      throw new Forbidden("You can not access this resource!");
    }

    next();
  };

exports.validateRegister = (req, res, next) => {
  // Validation body schema
  const validateBody = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
  });

  // The file is not required
  const validateFileBody = z
    .object({
      profile_picture: z
        .object({
          name: z.string(),
          data: z.any(),
        })
        .nullable()
        .optional(),
    })
    .nullable()
    .optional();

  // Validate
  const resultValidateBody = validateBody.safeParse(req.body);
  if (!resultValidateBody.success) {
    // If validation fails, return error messages
    throw new BadRequestError(resultValidateBody.error.errors);
  }

  // Validate
  const resultValidateFiles = validateFileBody.safeParse(req.files);
  if (!resultValidateFiles.success) {
    // If validation fails, return error messages
    throw new BadRequestError(resultValidateFiles.error.errors);
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  // Validation body schema
  const validateBody = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  // Validate
  const resultValidateBody = validateBody.safeParse(req.body);
  if (!resultValidateBody.success) {
    // If validation fails, return error messages
    throw new BadRequestError(resultValidateBody.error.errors);
  }

  next();
};

exports.validateProfile = async (req, res, next) => {
  // Check Authorization header for Bearer token
  // get token from request headers
  const authorizationHeader = req.headers["authorization"];
  if (!authorizationHeader) {
    throw new Unauthorized("You need to login in advance!");
  }

  const splittedAuthHeader = authorizationHeader.split(" ");
  if (splittedAuthHeader.length <= 1) {
    throw new Unauthorized("Token is not valid!");
  }

  const token = splittedAuthHeader[1];

  // extract the token
  const extractedToken = jwt.verify(token, process.env.JWT_SECRET);

  // get information of the user that has that token
  const user = await userRepository.getUserById(extractedToken.user_id);
  req.user = user;
  next();
};
