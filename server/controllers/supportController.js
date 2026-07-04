import SupportTicket from '../models/SupportTicket.js';
import logger from '../config/logger.js';
import { sendSupportTicketEmail } from '../utils/mailer.js';

export const createSupportTicket = async (req, res, next) => {
  try {
    const { senderName, senderEmail, category, subject, messageDetails, messageText } = req.body;

    const newTicket = await SupportTicket.create({
      sender: req.user ? req.user._id : null,
      senderName,
      senderEmail,
      category,
      subject,
      messageDetails: messageDetails || {},
      messageText,
    });

    logger.info(`New support ticket submitted: "${subject}" by ${senderEmail}`);

    // Send email notification to admin asynchronously
    sendSupportTicketEmail(newTicket).catch(err => {
      logger.error(`Failed to send email to admin: ${err.message}`);
    });

    res.status(201).json({
      success: true,
      message: 'Support request submitted successfully. The admin has been notified.',
      ticket: newTicket,
    });
  } catch (error) {
    next(error);
  }
};

export const getSupportTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({})
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
};

export const toggleTicketReadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found.' });
    }

    ticket.isRead = !ticket.isRead;
    await ticket.save();

    res.status(200).json({
      success: true,
      message: `Ticket marked as ${ticket.isRead ? 'read' : 'unread'}.`,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSupportTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found.' });
    }

    await ticket.deleteOne();
    logger.warn(`Support ticket deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Support ticket deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
