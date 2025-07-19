import messageModel from '../models/message.model.js';
import mongoose from 'mongoose';

export const createMessage = async ({ projectId, sender, message, senderType = 'user' }) => {
    if (!projectId) {
        throw new Error('ProjectId is required');
    }
    if (!sender) {
        throw new Error('Sender is required');
    }
    if (!message) {
        throw new Error('Message is required');
    }

    const newMessage = await messageModel.create({
        projectId,
        sender,
        message,
        senderType
    });

    return newMessage;
}

export const getProjectMessages = async ({ projectId, limit = 50 }) => {
    if (!projectId) {
        throw new Error('ProjectId is required');
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid projectId');
    }

    const messages = await messageModel.find({ projectId })
        .populate('sender', 'email')
        .sort({ createdAt: 1 }) // oldest first
        .limit(limit);

    return messages;
}