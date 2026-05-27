const express = require('express')
const router = express.Router()
const multer = require('multer')
const Groq = require('groq-sdk')
const fs = require('fs')
const path = require('path')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const upload = multer({ dest: 'uploads/' })

router.post('/', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file provided' })

  try {
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-large-v3',
      response_format: 'text',
    })

    // clean up uploaded file
    fs.unlinkSync(req.file.path)

    res.json({ text: transcription })
  } catch (err) {
    // clean up on error too
    if (req.file?.path) fs.unlinkSync(req.file.path)
    console.error('Transcription error:', err.message)
    res.status(500).json({ error: 'Transcription failed' })
  }
})

module.exports = router
