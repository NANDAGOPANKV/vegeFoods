// node mailer
const nodemailer = require("nodemailer");

// otp main sender
const nMailer = (email, otp, chengePassword) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "gamelarkco@gmail.com",
      pass: "cqfiriodtllholte",
    },
  });

  const mailOptions = {
    from: "gamelarkco@gmail.com",
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
