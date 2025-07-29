const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const unoconv = require('unoconv');
const os = require('os');
const tmp = require('tmp');
const fs = require('fs');
const archiver = require('archiver');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

// Verify ffmpeg is available
console.log('FFmpeg path:', ffmpegPath);
ffmpeg.getAvailableFormats((err, formats) => {
  if (err) {
    console.error('FFmpeg error:', err);
  } else {
    console.log('FFmpeg is working correctly');
  }
});

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

app.post('/api/convert', upload.array('file'), async (req, res) => {
  console.log('=== CONVERSION REQUEST RECEIVED ===');
  console.log('Body:', req.body);
  console.log('Files:', req.files ? req.files.map(f => ({ name: f.originalname, mimetype: f.mimetype, size: f.buffer.length })) : 'No files');
  console.log('Format:', req.body.format);
  
  const { format } = req.body;
  const files = req.files;
  if (!files || files.length === 0 || !format) {
    console.log('Validation failed:', { hasFiles: !!files, filesLength: files?.length, hasFormat: !!format });
    return res.status(400).json({ error: 'File(s) and format are required.' });
  }
  try {
    // Office file conversion using unoconv
    const officeMimes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/msword', // doc
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel', // xls
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
      'application/vnd.ms-powerpoint', // ppt
      'application/vnd.oasis.opendocument.text', // odt
      'application/vnd.oasis.opendocument.spreadsheet', // ods
      'application/vnd.oasis.opendocument.presentation', // odp
      'application/rtf', // rtf
    ];
    const officeExts = ['docx','doc','xlsx','xls','pptx','ppt','odt','ods','odp','rtf','txt'];
    // If any file is an office file and the target format is supported
    if (files.some(f => officeMimes.includes(f.mimetype) || officeExts.some(ext => f.originalname.toLowerCase().endsWith('.' + ext)))) {
      // Only support single file for office conversion for now
      const file = files[0];
      // Write buffer to temp file
      const inputTmp = tmp.tmpNameSync({ postfix: path.extname(file.originalname) });
      fs.writeFileSync(inputTmp, file.buffer);
      // Output temp file
      const outputTmp = tmp.tmpNameSync({ postfix: '.' + format });
      // Use unoconv to convert
      await new Promise((resolve, reject) => {
        unoconv.convert(inputTmp, format, function (err, result) {
          if (err) return reject(err);
          fs.writeFileSync(outputTmp, result);
          resolve();
        });
      });
      const outputBuffer = fs.readFileSync(outputTmp);
      // Clean up temp files
      fs.unlinkSync(inputTmp);
      fs.unlinkSync(outputTmp);
      res.setHeader('Content-Disposition', `attachment; filename=converted.${format}`);
      // Set content-type for common formats
      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (['docx','doc'].includes(format)) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      } else if (['xlsx','xls'].includes(format)) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      } else if (['pptx','ppt'].includes(format)) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      } else {
        res.setHeader('Content-Type', 'application/octet-stream');
      }
      return res.send(outputBuffer);
    }
    // If PDF, combine all images into a single PDF
    if (format === 'pdf') {
      // Accept both images and PDFs, merge all into a single PDF
      const pdfDoc = await PDFDocument.create();
      let addedAny = false;
      for (const f of files) {
        if (f.mimetype.startsWith('image/')) {
          let image, dims;
          try {
            // Try JPG first
            image = await pdfDoc.embedJpg(f.buffer);
            dims = image.scale(1);
          } catch {
            try {
              // Try PNG
              image = await pdfDoc.embedPng(f.buffer);
              dims = image.scale(1);
            } catch {
              try {
                // Convert to PNG using sharp, then embed
                const pngBuffer = await sharp(f.buffer).png().toBuffer();
                image = await pdfDoc.embedPng(pngBuffer);
                dims = image.scale(1);
              } catch {
                continue; // skip file if not a valid image
              }
            }
          }
          const page = pdfDoc.addPage([dims.width, dims.height]);
          page.drawImage(image, { x: 0, y: 0, width: dims.width, height: dims.height });
          addedAny = true;
        } else if (f.mimetype === 'application/pdf') {
          try {
            const donorPdf = await PDFDocument.load(f.buffer);
            const copiedPages = await pdfDoc.copyPages(donorPdf, donorPdf.getPageIndices());
            copiedPages.forEach((p) => pdfDoc.addPage(p));
            addedAny = true;
          } catch {
            continue; // skip file if not a valid PDF
          }
        }
      }
      if (!addedAny) {
        return res.status(400).json({ error: 'No valid images or PDFs provided for PDF conversion.' });
      }
      const pdfBytes = await pdfDoc.save();
      res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
      res.setHeader('Content-Type', 'application/pdf');
      return res.send(Buffer.from(pdfBytes));
    }
    // ZIP/TAR/TGZ archive creation
    if (["zip", "tar", "tgz"].includes(format)) {
      if (!Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'No files provided for archiving.' });
      }
      let archiveType = format;
      let contentType = '';
      let fileExt = '';
      if (format === "zip") {
        archiveType = "zip";
        contentType = "application/zip";
        fileExt = "zip";
      } else if (format === "tar") {
        archiveType = "tar";
        contentType = "application/x-tar";
        fileExt = "tar";
      } else if (format === "tgz") {
        archiveType = "tar";
        contentType = "application/gzip";
        fileExt = "tar.gz";
      }
      res.setHeader('Content-Disposition', `attachment; filename=archive.${fileExt}`);
      res.setHeader('Content-Type', contentType);
      const archive = archiver(archiveType, archiveType === 'tar' && format === 'tgz' ? { gzip: true } : {});
      archive.on('error', err => res.status(500).json({ error: err.message }));
      archive.pipe(res);
      files.forEach(f => {
        archive.append(f.buffer, { name: f.originalname });
      });
      archive.finalize();
      return;
    }
    // Single image conversion (first file only)
    if (["jpg", "jpeg", "png", "webp", "gif", "tiff"].includes(format)) {
      const file = files[0];
      if (!file) return res.status(400).json({ error: 'No file provided.' });
      try {
        let sharpInstance = sharp(file.buffer);
        
        // Handle different input formats properly
        if (format === 'jpg' || format === 'jpeg') {
          sharpInstance = sharpInstance.jpeg({ quality: 90 });
        } else if (format === 'png') {
          sharpInstance = sharpInstance.png();
        } else if (format === 'webp') {
          sharpInstance = sharpInstance.webp({ quality: 90 });
        } else if (format === 'gif') {
          sharpInstance = sharpInstance.gif();
        } else if (format === 'tiff') {
          sharpInstance = sharpInstance.tiff();
        }
        
        const outputBuffer = await sharpInstance.toBuffer();
        res.setHeader('Content-Disposition', `attachment; filename=converted.${format}`);
        res.setHeader('Content-Type', `image/${format === 'jpg' ? 'jpeg' : format}`);
        return res.send(outputBuffer);
      } catch (error) {
        console.error('Image conversion error:', error);
        return res.status(500).json({ error: `Image conversion failed: ${error.message}` });
      }
    }
    // Video conversion (mp4, mkv, avi, mov)
    const videoFormats = ["mp4", "mkv", "avi", "mov"];
    if (videoFormats.includes(format)) {
      const file = files[0];
      if (!file) return res.status(400).json({ error: 'No video file provided.' });
      
      console.log('Video conversion started:', {
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.buffer.length,
        targetFormat: format
      });
      
      // Write buffer to temp file
      const inputTmp = tmp.tmpNameSync({ postfix: path.extname(file.originalname) });
      fs.writeFileSync(inputTmp, file.buffer);
      const outputTmp = tmp.tmpNameSync({ postfix: '.' + format });
      
      try {
        await new Promise((resolve, reject) => {
          let ffmpegCommand = ffmpeg(inputTmp);
          
          // Configure based on output format
          if (format === 'mp4') {
            ffmpegCommand = ffmpegCommand.toFormat('mp4').videoCodec('libx264').audioCodec('aac');
          } else if (format === 'mkv') {
            ffmpegCommand = ffmpegCommand.toFormat('matroska');
          } else if (format === 'avi') {
            ffmpegCommand = ffmpegCommand.toFormat('avi').videoCodec('libx264').audioCodec('mp3');
          } else if (format === 'mov') {
            ffmpegCommand = ffmpegCommand.toFormat('mov').videoCodec('libx264').audioCodec('aac');
          }
          
          ffmpegCommand
            .on('start', (commandLine) => {
              console.log('FFmpeg command:', commandLine);
            })
            .on('progress', (progress) => {
              console.log('FFmpeg progress:', progress);
            })
            .on('end', () => {
              console.log('FFmpeg video conversion completed successfully');
              resolve();
            })
            .on('error', (err) => {
              console.error('FFmpeg video error:', err);
              reject(new Error('FFmpeg video failed: ' + err.message));
            })
            .save(outputTmp);
        });
        
        // Check if output file exists and has content
        if (!fs.existsSync(outputTmp)) {
          throw new Error('Output file was not created');
        }
        
        const outputStats = fs.statSync(outputTmp);
        if (outputStats.size === 0) {
          throw new Error('Output file is empty');
        }
        
        console.log('Video output file created successfully:', {
          path: outputTmp,
          size: outputStats.size
        });
        
      } catch (ffmpegErr) {
        console.error('Video conversion failed:', ffmpegErr);
        if (fs.existsSync(inputTmp)) fs.unlinkSync(inputTmp);
        if (fs.existsSync(outputTmp)) fs.unlinkSync(outputTmp);
        return res.status(500).json({ error: ffmpegErr.message || 'Video conversion failed.' });
      }
      
      const outputBuffer = fs.readFileSync(outputTmp);
      fs.unlinkSync(inputTmp);
      fs.unlinkSync(outputTmp);
      
      console.log('Video conversion completed, sending response');
      
      res.setHeader('Content-Disposition', `attachment; filename=converted.${format}`);
      res.setHeader('Content-Type', `video/${format}`);
      return res.send(outputBuffer);
    }
    // Audio conversion (mp3, wav, aac, ogg)
    const audioFormats = ["mp3", "wav", "aac", "ogg"];
    if (audioFormats.includes(format)) {
      const file = files[0];
      if (!file) return res.status(400).json({ error: 'No audio file provided.' });
      
      console.log('Audio conversion started:', {
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.buffer.length,
        targetFormat: format
      });
      
      // Write buffer to temp file
      const inputTmp = tmp.tmpNameSync({ postfix: path.extname(file.originalname) });
      fs.writeFileSync(inputTmp, file.buffer);
      const outputTmp = tmp.tmpNameSync({ postfix: '.' + format });
      
      console.log('Temp files created:', { inputTmp, outputTmp });
      
      try {
        await new Promise((resolve, reject) => {
          let ffmpegCommand = ffmpeg(inputTmp);
          
          // Configure based on output format
          if (format === 'mp3') {
            ffmpegCommand = ffmpegCommand.toFormat('mp3').audioCodec('libmp3lame');
          } else if (format === 'wav') {
            ffmpegCommand = ffmpegCommand.toFormat('wav').audioCodec('pcm_s16le');
          } else if (format === 'aac') {
            ffmpegCommand = ffmpegCommand.toFormat('aac').audioCodec('aac');
          } else if (format === 'ogg') {
            ffmpegCommand = ffmpegCommand.toFormat('ogg').audioCodec('libvorbis');
          }
          
          ffmpegCommand
            .on('start', (commandLine) => {
              console.log('FFmpeg command:', commandLine);
            })
            .on('progress', (progress) => {
              console.log('FFmpeg progress:', progress);
            })
            .on('end', () => {
              console.log('FFmpeg audio conversion completed successfully');
              resolve();
            })
            .on('error', (err) => {
              console.error('FFmpeg audio error:', err);
              reject(new Error('FFmpeg audio failed: ' + err.message));
            })
            .save(outputTmp);
        });
        
        // Check if output file exists and has content
        if (!fs.existsSync(outputTmp)) {
          throw new Error('Output file was not created');
        }
        
        const outputStats = fs.statSync(outputTmp);
        if (outputStats.size === 0) {
          throw new Error('Output file is empty');
        }
        
        console.log('Output file created successfully:', {
          path: outputTmp,
          size: outputStats.size
        });
        
      } catch (ffmpegErr) {
        console.error('Audio conversion failed:', ffmpegErr);
        if (fs.existsSync(inputTmp)) fs.unlinkSync(inputTmp);
        if (fs.existsSync(outputTmp)) fs.unlinkSync(outputTmp);
        return res.status(500).json({ error: ffmpegErr.message || 'Audio conversion failed.' });
      }
      
      const outputBuffer = fs.readFileSync(outputTmp);
      fs.unlinkSync(inputTmp);
      fs.unlinkSync(outputTmp);
      
      console.log('Audio conversion completed, sending response');
      
      res.setHeader('Content-Disposition', `attachment; filename=converted.${format}`);
      // Set appropriate content-type
      let contentType = 'audio/' + (format === 'mp3' ? 'mpeg' : format);
      res.setHeader('Content-Type', contentType);
      return res.send(outputBuffer);
    }
    return res.status(400).json({ error: `Unsupported format: ${format}. Supported formats: Images (jpg, jpeg, png, webp, gif, tiff), Videos (mp4, mkv, avi, mov), Audio (mp3, wav, aac, ogg), Documents (pdf, docx, txt, xlsx), Archives (zip).` });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Conversion failed.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 