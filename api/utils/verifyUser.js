import { errorHandler } from "./error.js";
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token; //will get cookie of signed in user.

  if (!token) return next(errorHandler(401, "Unauthorized"));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // if user is there error will be null.
    if (err) return next(errorHandler(403, "Forbidden"));
    req.user = user; //req.user is a way to store the info about the person (user) whose cookie has been verified.
    next();
  });
};
