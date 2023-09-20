import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const SECRET = process.env.SECRET;

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const isCustomAuth = token.length < 500;
    let decodeDate;
    if (token && isCustomAuth) {
      decodeDate = jwt.verify(token, SECRET);
      req.userId = decodeDate?.id;
    } else {
      decodeDate = jwt.decode(token);
      req.userId = decodeDate?.sub;
    }
    next();
  } catch (error) {
    console.log(error);
  }
};

export default auth;
