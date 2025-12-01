const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const rateLimit = require('../middleware/rateLimit');

// POST /api/canchas/:id/reviews -> create or update review for cancha
router.post('/canchas/:id/reviews', rateLimit, reviewsController.postReview);
// GET /api/canchas/:id/reviews
router.get('/canchas/:id/reviews', reviewsController.getReviews);
// GET /api/canchas/:id/stats
router.get('/canchas/:id/stats', reviewsController.getStats);
// GET /api/reviews/user?email=...
router.get('/reviews/user', reviewsController.getUserReviews);

module.exports = router;