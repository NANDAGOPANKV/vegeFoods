// node mailer
const nodemailer = require("nodemailer");

// dot env config
const dotenv = require("dotenv");
dotenv.config();

// otp main sender
const nMailer = (email, otp, chengePassword) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.email_id_otp,
      pass: process.env.App_Key,
    },
  });

  const mailOptions = {
    from: process.env.email_id_otp,
    to: email,
    subject: chengePassword ? `Your OTP for new password` : "Your OTP ",
    text: `Your OTP is ${otp}.`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = { nMailer };
