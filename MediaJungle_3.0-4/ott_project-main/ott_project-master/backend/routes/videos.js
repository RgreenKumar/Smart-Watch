const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all videos
router.get('/video/getall', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.id, v.video_title as "videoTitle", v.moviename, v.year, v.duration,
             v.language, v.description, v.vidofilename,
             COALESCE(ARRAY_AGG(DISTINCT vc.category_id) FILTER (WHERE vc.category_id IS NOT NULL), '{}') as categorylist
      FROM videos v
      LEFT JOIN video_categories vc ON v.id = vc.video_id
      GROUP BY v.id
      ORDER BY v.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get all videos error:', err);
    res.status(500).json({ message: 'Failed to load videos' });
  }
});

// Get video detail
router.get('/GetvideoDetail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT v.*,
             COALESCE(ARRAY_AGG(DISTINCT vc.category_id) FILTER (WHERE vc.category_id IS NOT NULL), '{}') as categorylist,
             COALESCE(ARRAY_AGG(DISTINCT vcas.cast_id) FILTER (WHERE vcas.cast_id IS NOT NULL), '{}') as castandcrewlist,
             COALESCE(ARRAY_AGG(DISTINCT vb.id) FILTER (WHERE vb.id IS NOT NULL), '{}') as taglist
      FROM videos v
      LEFT JOIN video_categories vc ON v.id = vc.video_id
      LEFT JOIN video_cast vcas ON v.id = vcas.video_id
      LEFT JOIN video_banners vb ON v.id = vb.video_id
      WHERE v.id = $1
      GROUP BY v.id
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      videoTitle: row.video_title,
      mainVideoDuration: row.main_video_duration || row.duration || '',
      trailerDuration: row.trailer_duration || '',
      rating: row.rating || '',
      certificateNumber: row.certificate_number || '',
      videoAccessType: row.video_access_type || false,
      description: row.description || '',
      productionCompany: row.production_company || '',
      certificateName: row.certificate_name || '',
      vidofilename: row.vidofilename || '',
      videotrailerfilename: row.videotrailerfilename || '',
      castandcrewlist: row.castandcrewlist || [],
      taglist: row.taglist || [],
      categorylist: row.categorylist || [],
      moviename: row.moviename || row.video_title,
      year: row.year || '',
      duration: row.duration || '',
      language: row.language || '',
    });
  } catch (err) {
    console.error('Get video detail error:', err);
    res.status(500).json({ message: 'Failed to load video detail' });
  }
});

// Get video container (grouped by category)
router.get('/getvideocontainer', async (req, res) => {
  try {
    const categories = await pool.query('SELECT category_id, categories FROM categories ORDER BY category_id');
    const containers = [];
    for (const cat of categories.rows) {
      const videos = await pool.query(`
        SELECT v.id, v.video_title as "videoTitle", v.main_video_duration, v.trailer_duration,
               v.rating, v.certificate_number, v.video_access_type, v.description,
               v.production_company, v.certificate_name, v.vidofilename, v.videotrailerfilename,
               COALESCE(ARRAY_AGG(DISTINCT vc2.category_id) FILTER (WHERE vc2.category_id IS NOT NULL), '{}') as categorylist
        FROM videos v
        JOIN video_categories vc ON v.id = vc.video_id AND vc.category_id = $1
        LEFT JOIN video_categories vc2 ON v.id = vc2.video_id
        GROUP BY v.id
      `, [cat.category_id]);
      if (videos.rows.length > 0) {
        containers.push({
          value: cat.categories,
          categoryid: cat.category_id,
          videoDescriptions: videos.rows.map(v => ({
            id: v.id,
            videoTitle: v.videoTitle,
            mainVideoDuration: v.main_video_duration || '',
            trailerDuration: v.trailer_duration || '',
            rating: v.rating || '',
            certificateNumber: v.certificate_number || '',
            videoAccessType: v.video_access_type || false,
            description: v.description || '',
            productionCompany: v.production_company || '',
            certificateName: v.certificate_name || '',
            vidofilename: v.vidofilename || '',
            videotrailerfilename: v.videotrailerfilename || '',
            castandcrewlist: [],
            taglist: [],
            categorylist: v.categorylist || [],
          })),
        });
      }
    }
    res.json(containers);
  } catch (err) {
    console.error('Get video container error:', err);
    res.status(500).json({ message: 'Failed to load video containers' });
  }
});

// Video screen details
router.get('/videoscreen', async (req, res) => {
  try {
    const { videoId, categoryId } = req.query;
    const result = await pool.query(`
      SELECT v.*,
             COALESCE(ARRAY_AGG(DISTINCT vc.category_id) FILTER (WHERE vc.category_id IS NOT NULL), '{}') as categorylist,
             COALESCE(ARRAY_AGG(DISTINCT vcas.cast_id) FILTER (WHERE vcas.cast_id IS NOT NULL), '{}') as castandcrewlist,
             COALESCE(ARRAY_AGG(DISTINCT vb.id) FILTER (WHERE vb.id IS NOT NULL), '{}') as taglist
      FROM videos v
      LEFT JOIN video_categories vc ON v.id = vc.video_id
      LEFT JOIN video_cast vcas ON v.id = vcas.video_id
      LEFT JOIN video_banners vb ON v.id = vb.video_id
      WHERE v.id = $1
      GROUP BY v.id
    `, [videoId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }
    const row = result.rows[0];
    res.json({
      videoDescriptions: [{
        id: row.id,
        videoTitle: row.video_title,
        mainVideoDuration: row.main_video_duration || '',
        trailerDuration: row.trailer_duration || '',
        rating: row.rating || '',
        certificateNumber: row.certificate_number || '',
        videoAccessType: row.video_access_type || false,
        description: row.description || '',
        productionCompany: row.production_company || '',
        certificateName: row.certificate_name || '',
        vidofilename: row.vidofilename || '',
        videotrailerfilename: row.videotrailerfilename || '',
        castandcrewlist: row.castandcrewlist || [],
        taglist: row.taglist || [],
        categorylist: row.categorylist || [],
      }],
    });
  } catch (err) {
    console.error('Video screen error:', err);
    res.status(500).json({ message: 'Failed' });
  }
});

// Video file streaming
router.get('/:id/videofile', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT video_file, vidofilename FROM videos WHERE id = $1', [id]);
    if (result.rows.length === 0 || !result.rows[0].video_file) {
      return res.status(404).json({ message: 'Video file not found' });
    }
    const videoFile = result.rows[0].video_file;
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : videoFile.length - 1;
      const chunk = videoFile.slice(start, end + 1);
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${videoFile.length}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunk.length,
        'Content-Type': 'video/mp4',
      });
      res.end(chunk);
    } else {
      res.writeHead(200, {
        'Content-Length': videoFile.length,
        'Content-Type': 'video/mp4',
      });
      res.end(videoFile);
    }
  } catch (err) {
    console.error('Video file error:', err);
    res.status(500).json({ message: 'Failed to stream video' });
  }
});

// Video banner image
router.get('/:id/videoBanner', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT video_banner FROM videos WHERE id = $1', [id]);
    if (result.rows.length === 0 || !result.rows[0].video_banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.set('Content-Type', 'image/jpeg');
    res.send(result.rows[0].video_banner);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Video thumbnail
router.get('/:id/videothumbnail', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT thumbnail FROM videos WHERE id = $1', [id]);
    if (result.rows.length === 0 || !result.rows[0].thumbnail) {
      return res.status(404).json({ message: 'Thumbnail not found' });
    }
    res.set('Content-Type', 'image/jpeg');
    res.send(result.rows[0].thumbnail);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// All video banners
router.get('/getallvideobanners', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, video_id as "videoId" FROM video_banners ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Get all video banners error:', err);
    res.status(500).json({ message: 'Failed' });
  }
});

module.exports = router;
