
// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');
// const ytdl = require('@distube/ytdl-core');
// const ffmpeg = require('fluent-ffmpeg');
// const ffmpegPath = require('ffmpeg-static');

// ffmpeg.setFfmpegPath(ffmpegPath);

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.static(path.join(__dirname, '../frontend')));

// app.get('/download', async (req, res) => {
//   const videoURL = req.query.url;
//   const format = req.query.format || '720p';

//   if (!videoURL || !ytdl.validateURL(videoURL)) {
//     return res.status(400).send('Invalid YouTube URL');
//   }

//   try {
//     const info = await ytdl.getInfo(videoURL);
//     const videoID = ytdl.getURLVideoID(videoURL);
//     const outputPath = path.resolve(__dirname, `../downloads/${videoID}.${format === 'mp3' ? 'mp3' : 'mp4'}`);

//     const videoFormat = ytdl.chooseFormat(info.formats, {
//       quality: format === 'mp3' ? '140' : format === '720p' ? '22' : '18',
//     });

//     const stream = ytdl.downloadFromInfo(info, { format: videoFormat });

//     if (format === 'mp3') {
//       ffmpeg(stream)
//         .audioBitrate(128)
//         .toFormat('mp3')
//         .save(outputPath)
//         .on('end', () => {
//           res.download(outputPath, `${videoID}.mp3`, () => fs.unlinkSync(outputPath));
//         })
//         .on('error', (err) => res.status(500).send('Error processing audio'));
//     } else {
//       ffmpeg(stream)
//         .videoCodec('libx264')
//         .audioCodec('aac')
//         .save(outputPath)
//         .on('end', () => {
//           res.download(outputPath, `${videoID}.mp4`, () => fs.unlinkSync(outputPath));
//         })
//         .on('error', (err) => res.status(500).send('Error processing video'));
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Failed to download video');
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });


// backend/index.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Get available formats
app.get('/formats', async (req, res) => {
  const videoURL = req.query.url;
  if (!videoURL || !ytdl.validateURL(videoURL)) {
    return res.status(400).json({ error: 'Invalid URL' });

  }

  try {
    const info = await ytdl.getInfo(videoURL);
    // const formats = info.formats
    //   .filter(format => format.container === 'mp4' && format.qualityLabel)
    //   .map(format => ({
    //     itag: format.itag,
    //     quality: format.qualityLabel,
    //     audio: !!format.audioBitrate,
    //     video: !!format.qualityLabel,
    //   }));

    const uniqueFormatsMap = new Map();

info.formats.forEach(format => {
  if (
    format.container === 'mp4' &&
    format.qualityLabel &&
    !uniqueFormatsMap.has(format.qualityLabel)
  ) {
    uniqueFormatsMap.set(format.qualityLabel, {
      itag: format.itag,
      quality: format.qualityLabel,
      audio: !!format.audioBitrate,
      video: !!format.qualityLabel,
    });
  }
});

const formats = Array.from(uniqueFormatsMap.values());


    res.json({ title: info.videoDetails.title, formats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch video formats' });

  }
});

// Download selected format
app.get('/download', async (req, res) => {
  const videoURL = req.query.url;
  const itag = req.query.itag;

  if (!videoURL || !itag) {
    return res.status(400).json({ error: 'Missing URL or format' });
  }

  try {
    const info = await ytdl.getInfo(videoURL);
    const format = ytdl.chooseFormat(info.formats, { quality: itag });

    if (!format || !format.url) {
      return res.status(404).json({ error: 'Format not found' });
    }

    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);

    ytdl(videoURL, { format }).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Download failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
