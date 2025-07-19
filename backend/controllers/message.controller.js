import * as messageService from '../services/message.service.js';

export const getProjectMessages = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { limit } = req.query;

        const messages = await messageService.getProjectMessages({
            projectId,
            limit: limit ? parseInt(limit) : 50
        });

        res.json({
            status: 'success',
            messages
        });

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}