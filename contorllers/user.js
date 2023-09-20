import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const SECRET = process.env.SECRET;
const HOST = process.env.SMTP_HOST;
const PORT = process.env.SMTP_PORT;
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;
import USer from '../models/userModel.js';
import ProfileModel from '../models/ProfileModel.js';
import User from '../models/userModel.js';

export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });

    const userProfile = await ProfileModel.findOne({
      userId: existingUser?._id,
    });

    if (!existingUser)
      return res.status(404).json({ message: "user doesn't exist" });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordCorrect)
      return res.status(400).json({ message: 'Invalid Credentials' });

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      SECRET,
      { expiresIn: '1h' },
    );
    res.status(200).json({ reuslt: existingUser, userProfile, token });
  } catch (error) {
    res.status(500).json({ message: 'something went wrong' });
  }
};

export const signup = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName, bio } =
    req.body;

  try {
    const existingUser = await User.findOne({ email });
    const userProfile = await ProfileModel.findOne({
      userId: existingUser?._id,
    });
    if (existingUser)
      return res.status(400).json({ message: 'User already exist' });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Password don't match" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.create({
      email,
      password: hashedPassword,
      name: `${firstName}${lastName}`,
      bio,
    });

    const token = jwt.sign({ email: result.email, id: result._id }, SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ result, userProfile, token });
  } catch (error) {
    res.status(500).json({ message: 'something went wrong' });
  }
};

export const forgotPassword = (req, res) => {
  const { email } = req.body;

  const transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    auth: {
      user: USER,
      pass: PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString('hex');
    User.findOne({ email: email }).then((user) => {
      if (!user) {
        return res
          .status(422)
          .json({ error: 'User does not eexist in our database' });
      }
      user.reseToken = token;
      user.expireToken = Date.name() + 3600000;
      user
        .save()
        .then((result) => {
          transporter.sendMail({
            to: user.email,
            from: 'Accountil <hello@accountill.com>',
            subject: 'Password resset request',
            html: `
          <p>You requested for password reset from Arc Invoicing application</p>
          <h5>Please click this <a href="https://accountill.com/reset/${token}">link</a> to reset your password</h5>
          <p>Link not clickable?, copy and paste the following url in your address bar.</p>
          <p>https://accountill.com/reset/${token}</p>
          <P>If this was a mistake, just ignore this email and nothing will happen.</P>
          `,
          });
          res.json({ message: 'Check Your email' });
        })
        .catch((err) => console.log(err));
    });
  });
};

export const resetPassword = (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;
  User.findOne({
    resetToken: sentToken,
    expireToken: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        return res.status(422).json({ error: 'try again session expired' });
      }
      bcrypt.hash(newPassword, 12).then((hashedPassword) => {
        user.password = hashedPassword;
        user.token = undefined;
        user.expireToken = undefined;
        user.save().then((saveduser) => {
          res.json({ message: 'password update success' });
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
