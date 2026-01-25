import { useState, useEffect } from "react";
import { apiRequest } from "../lib/api";

// Configuración de tablas con iconos y nombres amigables
const tableConfig = {
  usuarios: { name: "👥 Usuarios", icon: "👤", color: "blue" },
  averias: { name: "⚠️ Averías", icon: "🔧", color: "red" },
  repuestos: { name: "📦 Repuestos", icon: "📦", color: "green" },
  compras: { name: "🛒 Compras", icon: "🛍️", color: "purple" },
  asistencias: { name: "🆘 Asistencias", icon: "🚨", color: "orange" },
  ticket_statuses: { name: "📊 Estados de Tickets", icon: "📈", color: "indigo" },
  ticket_comments: { name: "💬 Comentarios", icon: "💭", color: "pink" },
  api_keys: { name: "🔑 Claves API", icon: "🔐", color: "yellow" },
  webhooks: { name: "🔗 Webhooks", icon: "🌐", color: "cyan" }
};

export default function DatabaseAdmin() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTables();
    loadStats();
  }, []);

  async function loadTables() {
    try {
      const data = await apiRequest("/api/database/tables");
      setTables(data.tables || []);
    } catch (err) {
      alert("❌ Error al cargar tablas: " + (err.message || err.error));
    }
  }

  async function loadStats() {
    try {
      const data = await apiRequest("/api/database/stats");
      setStats(data);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }

  async function loadTableData(tableName, pageNum = 1) {
    setLoading(true);
    try {
      const data = await apiRequest(`/api/database/table/${tableName}?page=${pageNum}&limit=20`);
      setTableData(data);
      setSelectedTable(tableName);
      setPage(pageNum);
    } catch (err) {
      alert("❌ Error al cargar datos: " + (err.message || err.error));
    } finally {
      setLoading(false);
    }
  }

  async function deleteRecord(tableName, id) {
    if (!confirm("⚠️ ¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.")) return;
    
    try {
      await apiRequest(`/api/database/table/${tableName}/${id}`, {
        method: "DELETE"
      });
      alert("✅ Registro eliminado exitosamente");
      loadTableData(tableName, page);
      loadStats(); // Recargar estadísticas
    } catch (err) {
      alert("❌ Error al eliminar: " + (err.message || err.error));
    }
  }

  const filteredTables = tables.filter(table => 
    table.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🗄️ Administración de Base de Datos</h1>
          <p className="text-gray-600">Gestiona y visualiza todos los datos del sistema</p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">👥</span>
                <span className="text-3xl font-bold">{stats.usuarios}</span>
              </div>
              <div className="text-sm font-medium">Usuarios Registrados</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">⚠️</span>
                <span className="text-3xl font-bold">{stats.averias}</span>
              </div>
              <div className="text-sm font-medium">Averías Reportadas</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">📦</span>
                <span className="text-3xl font-bold">{stats.repuestos}</span>
              </div>
              <div className="text-sm font-medium">Solicitudes de Repuestos</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🛒</span>
                <span className="text-3xl font-bold">{stats.compras}</span>
              </div>
              <div className="text-sm font-medium">Órdenes de Compra</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🆘</span>
                <span className="text-3xl font-bold">{stats.asistencias}</span>
              </div>
              <div className="text-sm font-medium">Asistencias Técnicas</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lista de tablas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">📋 Seleccionar Tabla</h2>
              
              {/* Buscador */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="🔍 Buscar tabla..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTables.map(table => {
                  const config = tableConfig[table] || { name: table, icon: "📄", color: "gray" };
                  return (
                    <button
                      key={table}
                      onClick={() => loadTableData(table)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedTable === table
                          ? `bg-${config.color}-100 border-2 border-${config.color}-500 shadow-md`
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.icon}</span>
                        <span className={`font-medium ${selectedTable === table ? `text-${config.color}-700` : "text-gray-700"}`}>
                          {config.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            {!selectedTable && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">👈</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">Selecciona una tabla</h3>
                <p className="text-gray-500">Elige una tabla de la lista para ver y gestionar sus registros</p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="inline-block animate-spin text-6xl mb-4">⏳</div>
                <div className="text-xl font-medium text-gray-700">Cargando datos...</div>
              </div>
            )}

            {!loading && tableData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {(tableConfig[tableData.tableName] || {}).name || tableData.tableName}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      📊 {tableData.total} registros totales
                    </p>
                  </div>
                  <div className="text-sm bg-gray-100 px-4 py-2 rounded-lg">
                    Página <span className="font-bold">{tableData.page}</span> de <span className="font-bold">{tableData.totalPages}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                        {tableData.columns.map(col => (
                          <th key={col.Field} className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-300">
                            {col.Field}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-center font-semibold text-gray-700 border-b-2 border-gray-300">⚡ Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.rows.map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-blue-50 transition-colors">
                          {tableData.columns.map(col => (
                            <td key={col.Field} className="px-4 py-3">
                              <div className="max-w-xs truncate">
                                {row[col.Field] === null ? (
                                  <span className="text-gray-400 italic text-xs">sin datos</span>
                                ) : typeof row[col.Field] === 'boolean' ? (
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${row[col.Field] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {row[col.Field] ? '✓ Sí' : '✗ No'}
                                  </span>
                                ) : (
                                  String(row[col.Field])
                                )}
                              </div>
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center">
                            {row.id && (
                              <button
                                onClick={() => deleteRecord(tableData.tableName, row.id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors"
                              >
                                🗑️ Eliminar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {tableData.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-6">
                    <button
                      onClick={() => loadTableData(tableData.tableName, page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                    >
                      ⬅️ Anterior
                    </button>
                    <span className="px-4 py-2 bg-gray-100 rounded-lg font-medium">
                      Página {page} de {tableData.totalPages}
                    </span>
                    <button
                      onClick={() => loadTableData(tableData.tableName, page + 1)}
                      disabled={page === tableData.totalPages}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                    >
                      Siguiente ➡️
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
