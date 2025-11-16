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
    <div className="relative flex min-h-screen w-full bg-gray-100 font-sans">
      <SideNavProvider />

      {/* Main content */}
      <main className="flex-1 flex-col min-w-0">
        <div className="p-8 max-w-7xl mx-auto">
        {/* estilos locales mínimos para aspecto limpio (sin tocar tipografía global) */}
        <style>{`
          .pr-card { background: #fff; border-radius: 12px; border: 1px solid rgba(2,6,23,0.04); box-shadow: 0 10px 28px rgba(2,6,23,0.04); overflow: visible; position: relative; }
          .pr-table th { text-align:left; padding: 14px; color:#374151; font-weight:600; background:#fafafa; }
          .pr-table td { padding: 14px; vertical-align: middle; color:#374151; }
          .pr-row + .pr-row { border-top: 1px solid rgba(2,6,23,0.04); }
          .pr-badge { display:inline-block; padding:6px 10px; border-radius:999px; font-weight:600; font-size:0.85rem; }
          .pr-actions-btn { padding:8px 12px; border-radius:8px; background:#f3f4f6; border:1px solid rgba(2,6,23,0.04); cursor:pointer; }
          .pr-dropdown { min-width:220px; border-radius:10px; overflow:hidden; box-shadow:0 8px 24px rgba(2,6,23,0.08); z-index: 50; }
          .pr-note { font-size:0.875rem; color:#6b7280; }
        `}</style>

          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
              <p className="text-gray-500">Consulta, filtra y gestiona tus reservas</p>
            </div>
          </div>

          {/* Filtros inspirados en el diseño propuesto (sin botón de nueva reserva) */}
          <div className="flex flex-wrap gap-3 items-end mb-6">
            <div className="relative">
              {/* Reemplazo del icono para evitar texto 'search' superpuesto */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                value={filters.usuario}
                onChange={(e) => setFilters(prev => ({ ...prev, usuario: e.target.value }))}
                placeholder="Buscar por usuario o cancha..."
                className="pl-10 pr-4 py-2 w-72 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Desde</label>
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
                className="bg-white border border-slate-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                aria-label="Filtrar desde fecha"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Hasta</label>
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
                className="bg-white border border-slate-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                aria-label="Filtrar hasta fecha"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Estado</label>
              <select value={filters.estado} onChange={(e)=>setFilters(prev=>({...prev, estado: e.target.value }))} className="bg-white border border-slate-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
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
                      <div className="font-medium text-gray-900">{r.cancha_nombre || r.cancha_id}</div>
                      {r.tipo && <div className="pr-note">{r.tipo}</div>}
                    </td>
                    <td className="py-2">
                      <div className="font-medium">{r.cliente_nombre || r.usuario_email || '-'}</div>
                      {r.cliente_telefono && <div className="pr-note">{r.cliente_telefono}</div>}
                    </td>
                    <td className="py-2 pr-note">{Reserva.formatearFecha(r.fecha)}</td>
                    <td className="py-2 pr-note">{formatTime(r.inicio)} — {formatTime(r.fin)}</td>
                    <td className="py-2">
                      <span
                        className="pr-badge"
                        style={{
                          background: r.estado === 'cancelada' ? 'rgba(239,68,68,0.12)' :
                                     r.estado === 'completada' ? 'rgba(107,114,128,0.12)' :
                                     'rgba(59,130,246,0.08)',
                          color: r.estado === 'cancelada' ? '#dc2626' :
                                 r.estado === 'completada' ? '#374151' :
                                 '#2563eb'
                        }}
                      >
                        {r.estado || 'programada'}
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
                        <div className="absolute right-0 mt-2 w-60 bg-white border pr-dropdown z-10">
                          {/* Cancelar */}
                          {(() => {
                            const info = getCancelInfo(r);
                            return (
                              <div className="px-3 py-2 border-b">
                                <button
                                  disabled={!info.allowed}
                                  onClick={() => info.allowed && cancelarReserva(r.id)}
                                  className={`w-full text-left ${info.allowed ? 'text-red-600' : 'text-gray-400 cursor-not-allowed'}`}
                                >Cancelar reserva</button>
                                {!info.allowed && <div className="text-xs text-gray-500 mt-1">{info.reason}</div>}
                              </div>
                            );
                          })()}

                          {/* Completar */}
                          {(() => {
                            const info = getCompleteInfo(r);
                            return (
                              <div className="px-3 py-2 border-b">
                                <button
                                  disabled={!info.allowed}
                                  onClick={() => info.allowed && completarReserva(r.id)}
                                  className={`w-full text-left ${info.allowed ? 'text-green-600' : 'text-gray-400 cursor-not-allowed'}`}
                                >Marcar como completada</button>
                                {!info.allowed && <div className="text-xs text-gray-500 mt-1">{info.reason}</div>}
                              </div>
                            );
                          })()}

                          {/* No-show */}
                          {(() => {
                            const info = getCompleteInfo(r); // mismo criterio temporal
                            return (
                              <div className="px-3 py-2">
                                <button
                                  disabled={!info.allowed}
                                  onClick={() => info.allowed && marcarNoShow(r.id)}
                                  className={`w-full text-left ${info.allowed ? 'text-yellow-600' : 'text-gray-400 cursor-not-allowed'}`}
                                >Marcar no se presenta Cliente (no-show)</button>
                                {!info.allowed && <div className="text-xs text-gray-500 mt-1">{info.reason}</div>}
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