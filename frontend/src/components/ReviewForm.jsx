import React from 'react';
import RatingWidget from './RatingWidget';
import reviewService from '../services/reviewService';
import { toast } from 'react-toastify';

export default function ReviewForm({ canchaId, currentUser, onSuccess }) {
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      toast.error('Selecciona una calificación entre 1 y 5');
      return;
    }
    setSending(true);
    try {
      const payload = {
        rating,
        comment: comment || null,
        user_name: currentUser?.nombre || null,
        user_email: currentUser?.email || null
      };
      const res = await reviewService.postReview(canchaId, payload);
      toast.success('Gracias por tu calificación');
      setComment('');
      setRating(res?.review?.rating || rating);
      if (onSuccess && res.stats) onSuccess(res.stats);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error al enviar la reseña');
    } finally {
      setSending(false);
    }
  };

  React.useEffect(() => {
    // Prefill existing review for this user (if email is available)
    let mounted = true;
    async function loadUserReview() {
      if (!currentUser?.email) { setLoaded(true); return; }
      try {
        const rows = await reviewService.getReviewsByUserEmail(currentUser.email);
        if (!mounted) return;
        const mine = (rows || []).find(r => r.cancha_id === canchaId);
        if (mine) {
          setRating(mine.rating);
          setComment(mine.comment || '');
        }
      } catch (err) {
        // ignore
      } finally {
        setLoaded(true);
      }
    }
    loadUserReview();
    return () => { mounted = false; };
  }, [canchaId, currentUser]);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <RatingWidget value={rating} onChange={setRating} />
      </div>
      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Deja un comentario opcional..."
          className="w-full p-3 rounded-md border border-slate-200 resize-y h-28"
          maxLength={1000}
        />
      </div>
      <div className="flex items-center justify-end">
        <button disabled={sending} className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-md shadow hover:opacity-95">
          {sending ? 'Enviando...' : 'Enviar calificación'}
        </button>
      </div>
    </form>
  );
}