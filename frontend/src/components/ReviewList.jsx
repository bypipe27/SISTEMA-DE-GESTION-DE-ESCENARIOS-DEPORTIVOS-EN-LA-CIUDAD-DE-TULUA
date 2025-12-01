import React from 'react';
import reviewService from '../services/reviewService';
import RatingWidget from './RatingWidget';
import useSocket from '../hooks/useSocket';

export default function ReviewsList({ canchaId }) {
  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const socket = useSocket(import.meta.env.VITE_API_BASE || null, {
    'review:created': (payload) => {
      try {
        if (payload?.canchaId === canchaId) {
          setReviews(prev => [payload.review, ...prev]);
        }
      } catch (e) {}
    },
    'cancha:statsUpdated': (payload) => {
      // we don't use stats here directly, but could trigger a re-fetch if needed
    }
  });

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    reviewService.getReviews(canchaId, 50, 0).then((res) => {
      if (mounted) {
        setReviews(res || []);
        setLoading(false);
      }
    }).catch(() => setLoading(false));
    return () => mounted = false;
  }, [canchaId]);

  if (loading) return <div className="py-6">Cargando reseñas...</div>;
  if (!reviews || reviews.length === 0) return <div className="py-6 text-sm text-slate-600">Aún no hay reseñas para esta cancha.</div>;

  return (
    <div className="space-y-4">
      {reviews.map(r => (
        <div key={r.id} className="bg-white/90 p-4 rounded-lg shadow-sm border border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="font-semibold text-slate-800">{r.user_name || (r.user_email ? r.user_email.split('@')[0] : 'Anónimo')}</div>
                <div className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <div className="mt-2 text-sm text-slate-700">{r.comment}</div>
            </div>
            <div className="flex-shrink-0">
              <RatingWidget value={r.rating} readOnly />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}