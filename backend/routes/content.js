import express from 'express';
import upload from '../middleware/upload.js';
import { extractText, generateAudioURL, generatePPTBuffer, formatForBraille } from '../services/fileService.js';
import { simplifyContent } from '../services/aiService.js';
import { protect } from './auth.js';
import History from '../models/History.js';

const router = express.Router();

// @route   POST /api/content/process
// @desc    Upload document and generate specific content based on disability
router.post('/process', protect, upload.single('file'), async (req, res) => {
  try {
    const { disability, grade, language = 'en-IN' } = req.body;
    // Parse formats - sent as comma-separated string from FormData
    const formats = req.body.formats ? req.body.formats.split(',') : ['simplified'];
    let text = req.body.text || '';

    // If file is provided, extract its text
    if (req.file) {
      text = await extractText(req.file.buffer, req.file.mimetype);
    }

    if (!text.trim()) {
      return res.status(400).json({ message: 'No content provided (either file or text is required)' });
    }

    // 1. Process via Groq based on disability logic
    const { simplifiedContent, brailleContent, audioScript, slides, videoSegments } = await simplifyContent(text, disability, grade, language);

    // 2. Generate ALL formats the user selected
    let responseData = {
      originalContentSample: text.substring(0, 100) + '...',
      simplifiedContent,
      audioScript,
      slides,
      videoSegments,
      disabilityProcessed: disability,
      gradeLevel: grade,
      language: language,
      selectedFormats: formats,
      assets: {}
    };

    // Audio — generate if user selected it
    if (formats.includes('audio')) {
      responseData.assets.hasAudio = true;
      responseData.assets.audioURL = generateAudioURL(audioScript || simplifiedContent, language);
    }

    // Braille — generate if user selected it
    if (formats.includes('braille')) {
      responseData.assets.brailleFormat = brailleContent || formatForBraille(simplifiedContent);
    }

    // Visual / PPT — generate if user selected visual OR it's always useful
    if (formats.includes('visual') || formats.includes('simplified')) {
      const pptBuffer = await generatePPTBuffer(slides, `Adapted Content: ${disability}`, disability);
      responseData.assets.pptBase64 = pptBuffer.toString('base64');
    }

    try {
      await History.create({
        userId: req.user._id,
        action: 'generate',
        title: req.body.title || 'Adapted Content Generation',
        metadata: {
          disability,
          gradeLevel: grade,
          formats
        }
      });
    } catch (e) {
      console.error('History tracking failed securely:', e);
    }

    res.json(responseData);
  } catch (error) {
    console.error('Process error:', error);
    res.status(500).json({ message: error.message || 'Error processing content', stack: error.stack });
  }
});

import axios from 'axios';

// @route   GET /api/content/pexels/search-video
// @desc    Search Pexels for a video based on keywords
router.get('/pexels/search-video', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Query is missing' });

    const response = await axios.get(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
      headers: { Authorization: process.env.PEXELS_API_KEY || 'no_key' }
    });

    if (response.data.videos && response.data.videos.length > 0) {
      const video = response.data.videos[0];
      const file = video.video_files.find(f => f.quality === 'hd') || video.video_files[0];
      return res.json({ videoUrl: file.link });
    }

    // Fallback: Try searching for a PEXELS IMAGE if no video exists
    const imgResponse = await axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
      headers: { Authorization: process.env.PEXELS_API_KEY || 'no_key' }
    });

    if (imgResponse.data.photos && imgResponse.data.photos.length > 0) {
       return res.json({ videoUrl: imgResponse.data.photos[0].src.large2x });
    }

    // Secondary Fallback: Try a generic educational related search
    res.status(404).json({ message: 'No media found' });
  } catch (error) {
    console.error('Pexels search error:', error.message);
    res.status(500).json({ message: 'Pexels API failure' });
  }
});

// @route   GET /api/content/pexels/search-photo
// @desc    Search Pexels for a photo
router.get('/pexels/search-photo', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Query is missing' });

    const response = await axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
      headers: { Authorization: process.env.PEXELS_API_KEY || 'no_key' }
    });

    if (response.data.photos && response.data.photos.length > 0) {
       return res.json({ photoUrl: response.data.photos[0].src.large2x });
    }
    res.status(404).json({ message: 'No photo found' });
  } catch (error) {
    res.status(500).json({ message: 'Pexels API failure' });
  }
});

// @route   POST /api/content/sarvam-tts
// @desc    Generate audio via Sarvam AI API
router.post('/sarvam-tts', async (req, res) => {
  try {
    const { text, targetLanguageCode = 'hi-IN' } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is missing' });

    const sarvamApiKey = process.env.SARVAM_API_KEY;
    if (!sarvamApiKey) {
       console.error("Sarvam API Key missing in environment");
       return res.status(500).json({ message: 'Sarvam API key configuration missing' });
    }

    const payload = {
      inputs: [text],
      target_language_code: targetLanguageCode,
      speaker: 'ritu', // Valid bulbul:v3 speaker
      speech_sample_rate: 8000,
      enable_preprocessing: true,
      model: 'bulbul:v3' // Replace with proper model if docs require
    };

    const response = await axios.post('https://api.sarvam.ai/text-to-speech', payload, {
      headers: { 
        'Content-Type': 'application/json',
        'api-subscription-key': sarvamApiKey
      }
    });

    if (response.data && response.data.audios && response.data.audios.length > 0) {
      // Returns base64 audio string usually
      return res.json({ audioBase64: response.data.audios[0] });
    }
    res.status(404).json({ message: 'No audio generated' });
  } catch (error) {
    console.error('Sarvam TTS API failure:', error.response?.data || error.message);
    res.status(500).json({ message: 'Sarvam API failure', error: error.response?.data || error.message });
  }
});

export default router;
