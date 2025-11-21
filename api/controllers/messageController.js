const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');
const { createNotification } = require('./notificationController');

/**
 * Get user conversations
 */
const getConversations = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(
    Conversation.find({
      participants: req.user._id
    }),
    req.query
  )
    .filter()
    .sort('-lastMessageAt')
    .limitFields()
    .paginate();

  const conversations = await features.query
    .populate('participants', 'name avatar businessName isActive lastActive')
    .populate('lastMessage')
    .populate('relatedProduct', 'name images price')
    .populate('relatedService', 'name images price');

  // Add unread count for each conversation
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        sender: { $ne: req.user._id },
        isRead: false
      });
      
      return {
        ...conv.toObject(),
        unreadCount
      };
    })
  );

  const total = await Conversation.countDocuments({
    participants: req.user._id
  });

  res.status(200).json(
    ApiResponse.success('تم جلب المحادثات بنجاح', {
      conversations: conversationsWithUnread,
      total,
      page: req.query.page * 1 || 1,
      limit: req.query.limit * 1 || 10
    })
  );
});

/**
 * Get or create conversation
 */
const getOrCreateConversation = asyncHandler(async (req, res, next) => {
  const { participantId, productId, serviceId } = req.body;

  if (!participantId) {
    return next(new AppError('معرف المشارك مطلوب', 400));
  }

  if (participantId === req.user._id.toString()) {
    return next(new AppError('لا يمكنك إنشاء محادثة مع نفسك', 400));
  }

  // Check if participant exists
  const participant = await User.findById(participantId);
  if (!participant) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  // Check for existing conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, participantId] },
    ...(productId && { relatedProduct: productId }),
    ...(serviceId && { relatedService: serviceId })
  })
    .populate('participants', 'name avatar businessName isActive lastActive')
    .populate('lastMessage')
    .populate('relatedProduct', 'name images price')
    .populate('relatedService', 'name images price');

  if (!conversation) {
    // Create new conversation
    conversation = await Conversation.create({
      participants: [req.user._id, participantId],
      ...(productId && { relatedProduct: productId }),
      ...(serviceId && { relatedService: serviceId }),
      createdBy: req.user._id
    });

    await conversation.populate([
      { path: 'participants', select: 'name avatar businessName isActive lastActive' },
      { path: 'relatedProduct', select: 'name images price' },
      { path: 'relatedService', select: 'name images price' }
    ]);
  }

  res.status(200).json(
    ApiResponse.success('تم جلب المحادثة بنجاح', { conversation })
  );
});

/**
 * Get conversation messages
 */
const getConversationMessages = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;

  // Check if user is participant in conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id
  });

  if (!conversation) {
    return next(new AppError('المحادثة غير موجودة أو غير مصرح لك بالوصول إليها', 404));
  }

  const features = new ApiFeatures(
    Message.find({ conversation: conversationId }),
    req.query
  )
    .filter()
    .sort('-createdAt')
    .limitFields()
    .paginate();

  const messages = await features.query
    .populate('sender', 'name avatar businessName')
    .populate('replyTo');

  // Mark messages as read
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: req.user._id },
      isRead: false
    },
    { isRead: true, readAt: new Date() }
  );

  const total = await Message.countDocuments({ conversation: conversationId });

  res.status(200).json(
    ApiResponse.success('تم جلب الرسائل بنجاح', {
      messages: messages.reverse(), // Show oldest first
      total,
      page: req.query.page * 1 || 1,
      limit: req.query.limit * 1 || 20
    })
  );
});

/**
 * Send message
 */
const sendMessage = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;
  const { content, type = 'text', attachments, replyTo } = req.body;

  if (!content && (!attachments || attachments.length === 0)) {
    return next(new AppError('محتوى الرسالة أو المرفقات مطلوبة', 400));
  }

  // Check if user is participant in conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id
  }).populate('participants', 'name avatar businessName fcmToken settings');

  if (!conversation) {
    return next(new AppError('المحادثة غير موجودة أو غير مصرح لك بالوصول إليها', 404));
  }

  // Create message
  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    content,
    type,
    attachments: attachments || [],
    replyTo: replyTo || null
  });

  // Update conversation last message
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
    lastMessageAt: new Date()
  });

  // Populate message
  await message.populate([
    { path: 'sender', select: 'name avatar businessName' },
    { path: 'replyTo' }
  ]);

  // Send notification to other participants
  const otherParticipants = conversation.participants.filter(
    p => p._id.toString() !== req.user._id.toString()
  );

  for (const participant of otherParticipants) {
    await createNotification({
      recipient: participant._id,
      sender: req.user._id,
      type: 'message',
      title: 'رسالة جديدة',
      message: `${req.user.name}: ${content ? content.substring(0, 50) + '...' : 'أرسل مرفق'}`,
      relatedConversation: conversationId
    });
  }

  // TODO: Emit real-time message via Socket.IO
  // io.to(conversationId).emit('newMessage', message);

  res.status(201).json(
    ApiResponse.success('تم إرسال الرسالة بنجاح', { message })
  );
});

/**
 * Edit message
 */
const editMessage = asyncHandler(async (req, res, next) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!content) {
    return next(new AppError('محتوى الرسالة مطلوب', 400));
  }

  const message = await Message.findOne({
    _id: messageId,
    sender: req.user._id
  });

  if (!message) {
    return next(new AppError('الرسالة غير موجودة أو غير مصرح لك بتعديلها', 404));
  }

  // Check if message is not too old (e.g., 15 minutes)
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  if (message.createdAt < fifteenMinutesAgo) {
    return next(new AppError('لا يمكن تعديل الرسالة بعد 15 دقيقة من إرسالها', 400));
  }

  message.content = content;
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  await message.populate([
    { path: 'sender', select: 'name avatar businessName' },
    { path: 'replyTo' }
  ]);

  // TODO: Emit real-time message update via Socket.IO
  // io.to(message.conversation.toString()).emit('messageEdited', message);

  res.status(200).json(
    ApiResponse.success('تم تعديل الرسالة بنجاح', { message })
  );
});

/**
 * Delete message
 */
const deleteMessage = asyncHandler(async (req, res, next) => {
  const { messageId } = req.params;

  const message = await Message.findOne({
    _id: messageId,
    sender: req.user._id
  });

  if (!message) {
    return next(new AppError('الرسالة غير موجودة أو غير مصرح لك بحذفها', 404));
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.content = 'تم حذف هذه الرسالة';
  await message.save();

  // TODO: Emit real-time message deletion via Socket.IO
  // io.to(message.conversation.toString()).emit('messageDeleted', message);

  res.status(200).json(
    ApiResponse.success('تم حذف الرسالة بنجاح')
  );
});

/**
 * Mark conversation as read
 */
const markConversationAsRead = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;

  // Check if user is participant in conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id
  });

  if (!conversation) {
    return next(new AppError('المحادثة غير موجودة أو غير مصرح لك بالوصول إليها', 404));
  }

  // Mark all unread messages as read
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: req.user._id },
      isRead: false
    },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json(
    ApiResponse.success('تم تحديد المحادثة كمقروءة بنجاح')
  );
});

/**
 * Delete conversation
 */
const deleteConversation = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;

  // Check if user is participant in conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id
  });

  if (!conversation) {
    return next(new AppError('المحادثة غير موجودة أو غير مصرح لك بالوصول إليها', 404));
  }

  // Delete all messages in conversation
  await Message.deleteMany({ conversation: conversationId });

  // Delete conversation
  await Conversation.findByIdAndDelete(conversationId);

  res.status(200).json(
    ApiResponse.success('تم حذف المحادثة بنجاح')
  );
});

/**
 * Search messages
 */
const searchMessages = asyncHandler(async (req, res, next) => {
  const { query, conversationId } = req.query;

  if (!query) {
    return next(new AppError('نص البحث مطلوب', 400));
  }

  let searchFilter = {
    $text: { $search: query },
    isDeleted: false
  };

  // If conversationId provided, search within specific conversation
  if (conversationId) {
    // Check if user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return next(new AppError('المحادثة غير موجودة أو غير مصرح لك بالوصول إليها', 404));
    }

    searchFilter.conversation = conversationId;
  } else {
    // Search in all user's conversations
    const userConversations = await Conversation.find({
      participants: req.user._id
    }).select('_id');

    searchFilter.conversation = { $in: userConversations.map(c => c._id) };
  }

  const features = new ApiFeatures(
    Message.find(searchFilter),
    req.query
  )
    .filter()
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .limitFields()
    .paginate();

  const messages = await features.query
    .populate('sender', 'name avatar businessName')
    .populate('conversation', 'participants')
    .populate('replyTo');

  const total = await Message.countDocuments(searchFilter);

  res.status(200).json(
    ApiResponse.success('تم البحث في الرسائل بنجاح', {
      messages,
      total,
      query,
      page: req.query.page * 1 || 1,
      limit: req.query.limit * 1 || 20
    })
  );
});

/**
 * Get message statistics (Admin only)
 */
const getMessageStats = asyncHandler(async (req, res, next) => {
  const stats = await Message.aggregate([
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        readMessages: { $sum: { $cond: ['$isRead', 1, 0] } },
        unreadMessages: { $sum: { $cond: ['$isRead', 0, 1] } },
        deletedMessages: { $sum: { $cond: ['$isDeleted', 1, 0] } }
      }
    }
  ]);

  const typeStats = await Message.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  const dailyStats = await Message.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const conversationStats = await Conversation.aggregate([
    {
      $group: {
        _id: null,
        totalConversations: { $sum: 1 },
        activeConversations: {
          $sum: {
            $cond: [
              { $gte: ['$lastMessageAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  res.status(200).json(
    ApiResponse.success('تم جلب إحصائيات الرسائل بنجاح', {
      messages: stats[0] || { totalMessages: 0, readMessages: 0, unreadMessages: 0, deletedMessages: 0 },
      conversations: conversationStats[0] || { totalConversations: 0, activeConversations: 0 },
      byType: typeStats,
      daily: dailyStats
    })
  );
});

module.exports = {
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
};