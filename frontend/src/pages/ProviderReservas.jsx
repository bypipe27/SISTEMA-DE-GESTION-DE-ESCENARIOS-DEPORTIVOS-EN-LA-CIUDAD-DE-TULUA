import React from "react";
import SideNavProvider from "../components/SideNavProvider";
import { useProviderReservasManager } from "../hooks/useProviderReservasManager";
import Reserva from "../models/Reserva";

function ProviderReservas() {
  const {
    reservas,
    filters,
    setFilters,
    loading,
    openMenu,
    setOpenMenu,
    getCancelInfo,
    getCompleteInfo,
    cancelarReserva,
    completarReserva,
    marcarNoShow
  } = useProviderReservasManager();

  // Funciones auxiliares de formato
  function formatTime(t) {
    if (!t) return "";
    if (typeof t === 'string') {
      const m = t.match(/^(\d{2}:\d{2})/);
      if (m) return m[1];
      if (t.includes('T')) {
        try { return new Date(t).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }); } catch {}
      }
      return t;
    }
    if (t instanceof Date) return t.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    return String(t);
  }

  return (
    <div className="relative flex min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 font-sans">
      <SideNavProvider />

      {/* Main content */}
      <main className="flex-1 flex-col min-w-0">
        <div className="p-8 max-w-7xl mx-auto">
        {/* estilos locales mínimos para aspecto limpio (sin tocar tipografía global) */}
        <style>{`
          .pr-card { background: #ffffff; border-radius: 20px; border: 2px solid #a78bfa; box-shadow: 0 20px 40px rgba(139,92,246,0.15); overflow: hidden; position: relative; }
          .pr-table { border-collapse: separate; border-spacing: 0; }
          .pr-table th { text-align:left; padding: 16px; color:#ffffff; font-weight:700; background: linear-gradient(135deg, #8b5cf6, #a78bfa); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; border: none; }
          .pr-table th:first-child { border-radius: 0; }
          .pr-table th:last-child { border-radius: 0; }
          .pr-table td { padding: 16px; vertical-align: middle; color:#374151; background: #ffffff; }
          .pr-row:nth-child(even) td { background: linear-gradient(to right, #faf5ff, #f3e8ff); }
          .pr-row:hover td { background: linear-gradient(to right, #e9d5ff, #ddd6fe) !important; }
          .pr-badge { display:inline-block; padding:8px 14px; border-radius:999px; font-weight:700; font-size:0.8rem; letter-spacing:0.02em; }
          .pr-actions-btn { padding:10px 16px; border-radius:12px; background: linear-gradient(135deg, #8b5cf6, #a78bfa); border:2px solid #7c3aed; color: #ffffff; cursor:pointer; font-weight:700; transition: all 0.2s; }
          .pr-actions-btn:hover { background: linear-gradient(135deg, #7c3aed, #8b5cf6); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(139,92,246,0.3); }
          .pr-dropdown { min-width:240px; border-radius:16px; overflow:hidden; box-shadow:0 12px 32px rgba(2,6,23,0.15); z-index: 50; border: 2px solid rgba(2,6,23,0.08); }
          .pr-note { font-size:0.875rem; color:#6b7280; font-weight:500; }
        `}</style>

          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">📋 Gestión de Reservas</h1>
              <p className="text-gray-600 text-lg font-medium">Consulta, filtra y gestiona tus reservas</p>
            </div>
          </div>

          {/* Filtros inspirados en el diseño propuesto (sin botón de nueva reserva) */}
          <div className="flex flex-wrap gap-4 items-end mb-8 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 p-6 rounded-2xl shadow-lg border-2 border-indigo-300">
            <div className="relative">
              {/* Reemplazo del icono para evitar texto 'search' superpuesto */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                value={filters.usuario}
                onChange={(e) => setFilters(prev => ({ ...prev, usuario: e.target.value }))}
                placeholder="🔍 Buscar por usuario o cancha..."
                className="pl-11 pr-4 py-3 w-80 bg-white border-2 border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 font-medium shadow-sm hover:border-indigo-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-indigo-900 mb-2 font-bold">📅 Desde</label>
              <input
                type="date"
                value={filters.from}
                max={filters.to || undefined}
                onChange={(e)=>{
                  const from = e.target.value;
                  setFilters(prev => {
                    let to = prev.to;
                    if (to && from && to < from) {
                      to = from; // forzar que 'hasta' nunca sea menor que 'desde'
                    }
                    return { ...prev, from, to };
                  });
                }}
                className="bg-white border-2 border-indigo-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium shadow-sm hover:border-indigo-400 transition-colors"
                aria-label="Filtrar desde fecha"
              />
            </div>
            <div>
              <label className="block text-sm text-indigo-900 mb-2 font-bold">📅 Hasta</label>
              <input
                type="date"
                value={filters.to}
                min={filters.from || undefined}
                onChange={(e)=>{
                  const to = e.target.value;
                  setFilters(prev => {
                    let newTo = to;
                    if (prev.from && newTo && newTo < prev.from) {
                      newTo = prev.from; // corregir entradas manuales inválidas
                    }
                    return { ...prev, to: newTo };
                  });
                }}
                className="bg-white border-2 border-indigo-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium shadow-sm hover:border-indigo-400 transition-colors"
                aria-label="Filtrar hasta fecha"
              />
            </div>
            <div>
              <label className="block text-sm text-indigo-900 mb-2 font-bold">🔖 Estado</label>
              <select value={filters.estado} onChange={(e)=>setFilters(prev=>({...prev, estado: e.target.value }))} className="bg-white border-2 border-indigo-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium shadow-sm hover:border-indigo-400 transition-colors cursor-pointer">
                <option value="">Todos</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
                <option value="programada">Pendiente/Programada</option>
              </select>
            </div>
          </div>

          {loading ? <p className="pr-note">Cargando...</p> :
          <div className="pr-card">
            <table className="w-full table-auto pr-table">
              <thead>
                <tr>
                  <th>Cancha</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th style={{width: 180}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map(r => (
                  <tr key={r.id} className="pr-row">
                    <td className="py-2">
                      <div className="font-bold text-gray-900 text-base">⚽ {r.cancha_nombre || r.cancha_id}</div>
                      {r.tipo && <div className="pr-note">📍 {r.tipo}</div>}
                    </td>
                    <td className="py-2">
                      <div className="font-bold text-gray-900">👤 {r.cliente_nombre || r.usuario_email || '-'}</div>
                      {r.cliente_telefono && <div className="pr-note">📞 {r.cliente_telefono}</div>}
                    </td>
                    <td className="py-2 pr-note font-semibold">📅 {Reserva.formatearFecha(r.fecha)}</td>
                    <td className="py-2 pr-note font-semibold">⏰ {formatTime(r.inicio)} — {formatTime(r.fin)}</td>
                    <td className="py-2">
                      <span
                        className="pr-badge"
                        style={{
                          background: r.estado === 'cancelada' ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.2))' :
                                     r.estado === 'completada' ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.2))' :
                                     'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.2))',
                          color: r.estado === 'cancelada' ? '#dc2626' :
                                 r.estado === 'completada' ? '#059669' :
                                 '#2563eb',
                          border: r.estado === 'cancelada' ? '2px solid rgba(220,38,38,0.3)' :
                                  r.estado === 'completada' ? '2px solid rgba(5,150,105,0.3)' :
                                  '2px solid rgba(37,99,235,0.3)'
                        }}
                      >
                        {r.estado === 'cancelada' ? '❌ Cancelada' :
                         r.estado === 'completada' ? '✅ Completada' :
                         '⏰ ' + (r.estado || 'Programada')}
                      </span>
                    </td>
                    <td className="py-2 relative">
                      {/* Botón que abre el mini-menu */}
                      <button
                        onClick={() => setOpenMenu(openMenu === r.id ? null : r.id)}
                        className="pr-actions-btn"
                        aria-haspopup="true"
                        aria-expanded={openMenu === r.id}
                      >Acciones ▾</button>

                      {/* Menú desplegable */}
                      {openMenu === r.id && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border pr-dropdown z-10">
                          {/* Cancelar */}
                          {(() => {
                            const info = getCancelInfo(r);
                            return (
                              <div className="px-4 py-3 border-b-2 border-gray-100 hover:bg-red-50 transition-colors">
                                <button
                                  disabled={!info.allowed}
                                  onClick={() => info.allowed && cancelarReserva(r.id)}
                                  className={`w-full text-left font-bold ${info.allowed ? 'text-red-600' : 'text-gray-400 cursor-not-allowed'}`}
                                >❌ Cancelar reserva</button>
                                {!info.allowed && <div className="text-xs text-gray-600 mt-2 font-medium">{info.reason}</div>}
                              </div>
                            );
                          })()}

                          {/* Completar */}
                          {(() => {
                            const info = getCompleteInfo(r);
                            return (
                              <div className="px-4 py-3 border-b-2 border-gray-100 hover:bg-emerald-50 transition-colors">
                                <button
                                  disabled={!info.allowed}
                                  onClick={() => info.allowed && completarReserva(r.id)}
                                  className={`w-full text-left font-bold ${info.allowed ? 'text-emerald-600' : 'text-gray-400 cursor-not-allowed'}`}
                                >✅ Marcar como completada</button>
                                {!info.allowed && <div className="text-xs text-gray-600 mt-2 font-medium">{info.reason}</div>}
                              </div>
                            );
                          })()}

                          {/* No-show */}
                          {(() => {
                            const info = getCompleteInfo(r); // mismo criterio temporal
                            return (
                              <div className="px-4 py-3 hover:bg-yellow-50 transition-colors">
                                <button
                                  disabled={!info.allowed}
                                  onClick={() => info.allowed && marcarNoShow(r.id)}
                                  className={`w-full text-left font-bold ${info.allowed ? 'text-yellow-600' : 'text-gray-400 cursor-not-allowed'}`}
                                >⚠️ Cliente no se presentó (no-show)</button>
                                {!info.allowed && <div className="text-xs text-gray-600 mt-2 font-medium">{info.reason}</div>}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
        </div>
      </main>
    </div>
  );
}
export default ProviderReservas;
// ...existing code...