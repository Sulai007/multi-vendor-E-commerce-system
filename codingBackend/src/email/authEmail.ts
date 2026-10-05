import {transporter} from '../config/mailer'
import {config} from '../config/env';


export const sendOtpEmail = async (data: { to: string; firstName: string; code: string; purpose: string }) => {
  try {
    const mailOptions = {
        from: config.smtp.from.address,
        to: data.to,
        subject: 'Your OTP Code',
        text: `Hello ${data.firstName}, your OTP code is: ${data.code}.
        use this code to ${data.purpose}. It will expire in 10 minutes. Please do not share this code with anyone.`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};


export  const sendPasswordChangedEmail = async (data: { to: string; firstName: string }) => {
  try {
    const mailOptions = {
      from: config.smtp.from.address,
      to: data.to,
      subject: 'Password Changed',
      text: `Hello ${data.firstName}, your password has been changed successfully.`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password changed email:', error);
    throw new Error('Failed to send password changed email');
  }
};
