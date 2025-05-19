const express = require('express');
const router = express.Router();
const { generateResponse, executeCode } = require('../controllers/chatController');

router.post('/generate', generateResponse);
router.post('/execute', executeCode);

module.exports = router; 