const nodemailer = require('nodemailer');
require('dotenv').config({ path: './apps/api/.env' }); // Ensure .env is loaded

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: parseInt(process.env.EMAIL_PORT, 10) === 465, // true for 465, false for other ports like 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a collaborator invitation email.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} memoirTitle - The title of the memoir.
 * @param {string} authorName - The name of the memoir author inviting the collaborator.
 * @param {string} memoirId - The ID of the memoir to potentially include in an accept link.
 * @param {string} token - The token for the invitation.
 */
const sendInvitationEmail = async (
  toEmail,
  memoirTitle,
  authorName,
  memoirId,
  token,
) => {
  // Construct the correct frontend URL with the token
  const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; // Use env variable or default
  const acceptUrl = `${frontendBaseUrl}/invite/${memoirId}?token=${token}`; // Correct URL

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `Invitation to collaborate on memoir: ${memoirTitle}`,
    text: `Hello,\n\nYou have been invited by ${authorName} to collaborate on the memoir "${memoirTitle}".\n\nClick here to accept: ${acceptUrl}\n\nIf you did not expect this invitation, please ignore this email.\n\nThanks,\nThe PureTome Team`,
    html: `<p>Hello,</p>
           <p>You have been invited by <strong>${authorName}</strong> to collaborate on the memoir "<strong>${memoirTitle}</strong>".</p>
           <p><a href="${acceptUrl}">Click here to accept the invitation</a>.</p>
           <p>If you did not expect this invitation, please ignore this email.</p>
           <p>Thanks,<br/>The PureTome Team</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Invitation email sent to ${toEmail}`);
  } catch (error) {
    console.error(`Error sending invitation email to ${toEmail}:`, error);
    // Decide if you want to throw the error or handle it (e.g., log and continue)
    // throw new Error('Failed to send invitation email.');
  }
};

module.exports = { sendInvitationEmail };
