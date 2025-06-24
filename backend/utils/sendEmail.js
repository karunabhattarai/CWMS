import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user:'boyd.green18@ethereal.email',
        pass:'RGMTQYDAuvBW8pknNU'
        // testing so, no need to keep in env
    }
});
// for testing purposes we are using ethereal.email
// const transporter = nodemailer.createTransport({
//     service: 'gmail', // Use your email service here
//     auth: {
//         user: process.env.EMAIL_USER, // Your email address
//         pass: process.env.EMAIL_PASS // Your email password
//     }
// });

const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to, // List of recipients
        subject, // Subject line
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        // await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

        // return info; // Return info if controller needs it
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Re-throw the error for further handling if needed
    }

}

export default sendEmail;
// This function sends an email using nodemailer

//{frontend_url}/verify-email?token=${token}`; react bata banaunu parxa