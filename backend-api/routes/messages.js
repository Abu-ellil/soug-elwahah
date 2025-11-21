const express = require('express');
const {
  getConversations,
  getOrCreateConversation,
  getConversationMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markConversationAsRead,
  deleteConversation,
  searchMessages,
  getMessageStats
} = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Search messages across conversations
router.get('/search', [
  query('query').notEmpty().withMessage('Search query is required'),
  query('conversationId').optional().isMongoId().withMessage('Invalid conversation ID'),
  validate
], searchMessages);

// Get user conversations
router.get('/conversations', getConversations);

// Get or create conversation
router.post('/conversations', [
  body('participantId').isMongoId().withMessage('Valid participant ID is required'),
  body('productId').optional().isMongoId().withMessage('Invalid product ID'),
  body('serviceId').optional().isMongoId().withMessage('Invalid service ID'),
  validate
], getOrCreateConversation);

// Get conversation messages
router.get('/conversations/:conversationId/messages', [
  param('conversationId').isMongoId().withMessage('Invalid conversation ID'),
  validate
], getConversationMessages);

// Send message to conversation
router.post('/conversations/:conversationId/messages', [
  param('conversationId').isMongoId().withMessage('Invalid conversation ID'),
  body('content').optional().isString().withMessage('Message content must be string'),
  body('type').optional().isIn(['text', 'image', 'file', 'audio', 'video'])
    .withMessage('Invalid message type'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array'),
  body('replyTo').optional().isMongoId().withMessage('Invalid reply message ID'),
  validate
], sendMessage);

// Mark conversation as read
router.patch('/conversations/:conversationId/read', [
  param('conversationId').isMongoId().withMessage('Invalid conversation ID'),
  validate
], markConversationAsRead);

// Delete conversation
router.delete('/conversations/:conversationId', [
  param('conversationId').isMongoId().withMessage('Invalid conversation ID'),
  validate
], deleteConversation);

// Edit message
router.patch('/:messageId', [
  param('messageId').isMongoId().withMessage('Invalid message ID'),
  body('content').notEmpty().withMessage('Message content is required'),
  validate
], editMessage);

// Delete message
router.delete('/:messageId', [
  param('messageId').isMongoId().withMessage('Invalid message ID'),
  validate
], deleteMessage);

// Admin only routes
router.use(authorize('admin'));

// Get message statistics
router.get('/stats', getMessageStats);

module.exports = router;