const db = require('../db.js');
const pool = db.pool || db.default || db;

async function getReviewsByCancha(canchaId, limit = 20, offset = 0) {
  const q = `SELECT r.id, r.cancha_id, r.user_id, r.user_name, r.user_email, r.rating, r.comment, r.created_at
    FROM reviews r
    WHERE r.cancha_id = $1
    ORDER BY r.created_at DESC
    LIMIT $2 OFFSET $3`;
  const { rows } = await pool.query(q, [canchaId, limit, offset]);
  return rows;
}

async function getUserReviewForCancha(canchaId, userId) {
  if (!userId) return null;
  const q = `SELECT * FROM reviews WHERE cancha_id = $1 AND user_id = $2 LIMIT 1`;
  const { rows } = await pool.query(q, [canchaId, userId]);
  return rows[0] || null;
}

async function getCanchaStats(canchaId) {
  const q = `SELECT COALESCE(avg_rating,0)::numeric(3,2) as avg_rating, COALESCE(reviews_count,0)::int as reviews_count FROM canchas WHERE id = $1 LIMIT 1`;
  const { rows } = await pool.query(q, [canchaId]);
  return rows[0] || { avg_rating: 0, reviews_count: 0 };
}

async function createOrUpdateReview({ canchaId, userId = null, userName = null, userEmail = null, rating, comment = null, reservaId = null }) {
  // If userId provided, try update existing review by that user for that cancha
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let review = null;
    if (userId) {
      const sel = `SELECT * FROM reviews WHERE cancha_id = $1 AND user_id = $2 LIMIT 1`;
      const selR = await client.query(sel, [canchaId, userId]);
      if (selR.rows.length > 0) {
        const u = `UPDATE reviews SET rating = $1, comment = $2, reserva_id = $3, updated_at = now() WHERE id = $4 RETURNING *`;
        const ur = await client.query(u, [rating, comment, reservaId, selR.rows[0].id]);
        review = ur.rows[0];
      } else {
        const ins = `INSERT INTO reviews (cancha_id, reserva_id, user_id, user_name, user_email, rating, comment) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
        const ir = await client.query(ins, [canchaId, reservaId, userId, userName, userEmail, rating, comment]);
        review = ir.rows[0];
      }
    } else {
      // anonymous review: always insert
      const ins = `INSERT INTO reviews (cancha_id, reserva_id, user_name, user_email, rating, comment) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
      const ir = await client.query(ins, [canchaId, reservaId, userName, userEmail, rating, comment]);
      review = ir.rows[0];
    }

    // Recompute stats for the cancha and update canchas table
    const statsQ = `SELECT AVG(rating)::numeric(5,4) as avg_rating, COUNT(*)::int as reviews_count FROM reviews WHERE cancha_id = $1`;
    const statsR = await client.query(statsQ, [canchaId]);
    const avg = parseFloat(statsR.rows[0].avg_rating || 0).toFixed(2);
    const cnt = parseInt(statsR.rows[0].reviews_count || 0, 10);

    const updCancha = `UPDATE canchas SET avg_rating = $1, reviews_count = $2 WHERE id = $3`;
    await client.query(updCancha, [avg, cnt, canchaId]);

    // If a reservaId was provided, mark the reserva as reviewed (helpful for UI indicators)
    if (reservaId) {
      const updReserva = `UPDATE reservas SET reviewed_at = now() WHERE id = $1`;
      await client.query(updReserva, [reservaId]);
    }

    await client.query('COMMIT');
    return { review, stats: { avg_rating: parseFloat(avg), reviews_count: cnt } };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  getReviewsByCancha,
  getUserReviewForCancha,
  getCanchaStats,
  createOrUpdateReview,
};

// Obtener reseñas por email de usuario (historial cuando no hay autenticación)
async function getReviewsByUserEmail(email) {
  const q = `SELECT * FROM reviews WHERE user_email = $1 ORDER BY created_at DESC`;
  const { rows } = await pool.query(q, [email]);
  return rows;
}

module.exports.getReviewsByUserEmail = getReviewsByUserEmail;