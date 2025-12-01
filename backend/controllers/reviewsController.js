const reviewModel = require('../models/reviewModel');

async function postReview(req, res, next) {
  try {
    const canchaId = parseInt(req.params.id, 10);
    if (Number.isNaN(canchaId)) return res.status(400).json({ error: 'cancha id inválido' });

    const { rating, comment, reserva_id, user_name, user_email } = req.body;
    const userId = req.user?.id || null; // auth optional: if present use it

    // Validaciones básicas
    const r = parseInt(rating, 10);
    if (!r || Number.isNaN(r) || r < 1 || r > 5) {
      return res.status(400).json({ error: 'rating inválido (1-5)' });
    }

    // Comentario: sanitizar y limitar longitud
    const sanitize = require('sanitize-html');
    let safeComment = null;
    if (typeof comment === 'string' && comment.trim() !== '') {
      // permitir solo texto básico (sin tags) y limitar a 1000 chars
      const cleaned = sanitize(comment, { allowedTags: [], allowedAttributes: {} }).trim();
      safeComment = cleaned.substring(0, 1000);
    }

    const payload = {
      canchaId,
      userId,
      userName: user_name || null,
      userEmail: user_email || null,
      rating: r,
      comment: safeComment,
      reservaId: reserva_id || null,
    };

    const result = await reviewModel.createOrUpdateReview(payload);

    // Emit socket events if available
    try {
      const io = req.app && req.app.get && req.app.get('io');
      if (io) {
        io.emit('review:created', { canchaId, review: result.review });
        io.emit('cancha:statsUpdated', { canchaId, stats: result.stats });
      }
    } catch (e) {
      // ignore socket errors
    }

    return res.status(201).json({ review: result.review, stats: result.stats });
  } catch (err) {
    next(err);
  }
}

async function getReviews(req, res, next) {
  try {
    const canchaId = parseInt(req.params.id, 10);
    if (Number.isNaN(canchaId)) return res.status(400).json({ error: 'cancha id inválido' });
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;
    const rows = await reviewModel.getReviewsByCancha(canchaId, limit, offset);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const canchaId = parseInt(req.params.id, 10);
    if (Number.isNaN(canchaId)) return res.status(400).json({ error: 'cancha id inválido' });
    const stats = await reviewModel.getCanchaStats(canchaId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

async function getUserReviews(req, res, next) {
  try {
    const email = (req.query.email || '').toString().trim();
    if (!email) return res.status(400).json({ error: 'email requerido' });
    const rows = await reviewModel.getReviewsByUserEmail(email);
    res.json(rows || []);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  postReview,
  getReviews,
  getStats,
  getUserReviews,
};