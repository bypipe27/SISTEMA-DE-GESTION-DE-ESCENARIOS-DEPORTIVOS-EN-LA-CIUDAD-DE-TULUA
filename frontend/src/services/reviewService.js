import api from './api';

export async function postReview(canchaId, body) {
  return api.post(`/api/canchas/${canchaId}/reviews`, body);
}

export async function getReviews(canchaId, limit = 20, offset = 0) {
  return api.get(`/api/canchas/${canchaId}/reviews?limit=${limit}&offset=${offset}`);
}

export async function getStats(canchaId) {
  return api.get(`/api/canchas/${canchaId}/stats`);
}

export async function getReviewsByUserEmail(email) {
  return api.get(`/api/reviews/user?email=${encodeURIComponent(email)}`);
}

const reviewService = { postReview, getReviews, getStats };
export default reviewService;