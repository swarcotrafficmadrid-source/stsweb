import { useState, useEffect } from "react";
import { apiRequest } from "../lib/api";

export default function DatabaseAdmin() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [customQuery, setCustomQuery] = useState("");
  const [queryResults, setQueryResults] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadTables();
    loadStats();
  }, []);

  async function loadTables() {
    try {
      const data = await apiRequest("/api/database/tables");
      setTables(data.tables || []);
    } catch (err) {
      alert("Error al cargar tablas: " + (err.message || err.error));
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
      const data = await apiRequest(`/api/database/table/${tableName}?page=${pageNum}&limit=50`);
      setTableData(data);
      setSelectedTable(tableName);
      setPage(pageNum);
    } catch (err) {
      alert("Error al cargar datos: " + (err.message || err.error));
    } finally {
      setLoading(false);
    }
  }

  async function deleteRecord(tableName, id) {
    if (!confirm(`¿Eliminar registro ID ${id} de ${tableName}?`)) return;
    
    try {
      await apiRequest(`/api/database/table/${tableName}/${id}`, {
        method: "DELETE"
      });
      alert("Registro eliminado");
      loadTableData(tableName, page);
    } catch (err) {
      alert("Error al eliminar: " + (err.message || err.error));
    }
  }

  async function executeQuery() {
    if (!customQuery.trim()) return;
    setLoading(true);
    try {
      const data = await apiRequest("/api/database/query", {
        method: "POST",
        body: { query: customQuery }
      });
      setQueryResults(data);
    } catch (err) {
      alert("Error en consulta: " + (err.message || err.error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Panel de Administración de Base de Datos</h1>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Usuarios</div>
              <div className="text-2xl font-bold text-blue-600">{stats.usuarios}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Averías</div>
              <div className="text-2xl font-bold text-red-600">{stats.averias}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Repuestos</div>
              <div className="text-2xl font-bold text-green-600">{stats.repuestos}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Compras</div>
              <div className="text-2xl font-bold text-purple-600">{stats.compras}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Asistencias</div>
              <div className="text-2xl font-bold text-orange-600">{stats.asistencias}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-6">
          {/* Lista de tablas */}
          <div className="col-span-1 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Tablas</h2>
            <div className="space-y-2">
              {tables.map(table => (
                <button
                  key={table}
                  onClick={() => loadTableData(table)}
                  className={`w-full text-left px-3 py-2 rounded ${
                    selectedTable === table
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {table}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="col-span-3 space-y-6">
            {/* Consulta personalizada */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Consulta SQL (solo SELECT)</h2>
              <div className="flex gap-2">
                <textarea
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="SELECT * FROM usuarios LIMIT 10"
                  className="flex-1 px-3 py-2 border rounded font-mono text-sm"
                  rows="3"
                />
                <button
                  onClick={executeQuery}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Ejecutar
                </button>
              </div>

              {queryResults && (
                <div className="mt-4">
                  <div className="text-sm text-gray-600 mb-2">{queryResults.count} resultados</div>
                  <div className="overflow-auto max-h-96">
                    <pre className="text-xs bg-gray-50 p-3 rounded">
                      {JSON.stringify(queryResults.results, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Datos de tabla seleccionada */}
            {loading && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-500">Cargando...</div>
              </div>
            )}

            {!loading && tableData && (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">{tableData.tableName}</h2>
                  <div className="text-sm text-gray-600">
                    {tableData.total} registros totales | Página {tableData.page} de {tableData.totalPages}
                  </div>
                </div>

                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        {tableData.columns.map(col => (
                          <th key={col.Field} className="px-3 py-2 text-left font-medium">
                            {col.Field}
                            <span className="text-gray-500 font-normal ml-1">({col.Type})</span>
                          </th>
                        ))}
                        <th className="px-3 py-2 text-left font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.rows.map((row, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          {tableData.columns.map(col => (
                            <td key={col.Field} className="px-3 py-2">
                              <div className="max-w-xs truncate">
                                {row[col.Field] === null ? (
                                  <span className="text-gray-400 italic">NULL</span>
                                ) : typeof row[col.Field] === 'object' ? (
                                  JSON.stringify(row[col.Field])
                                ) : (
                                  String(row[col.Field])
                                )}
                              </div>
                            </td>
                          ))}
                          <td className="px-3 py-2">
                            {row.id && (
                              <button
                                onClick={() => deleteRecord(tableData.tableName, row.id)}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                Eliminar
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
                  <div className="flex justify-center gap-2 mt-4">
                    <button
                      onClick={() => loadTableData(tableData.tableName, page - 1)}
                      disabled={page === 1}
                      className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <span className="px-3 py-1">
                      Página {page} de {tableData.totalPages}
                    </span>
                    <button
                      onClick={() => loadTableData(tableData.tableName, page + 1)}
                      disabled={page === tableData.totalPages}
                      className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                      Siguiente
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
