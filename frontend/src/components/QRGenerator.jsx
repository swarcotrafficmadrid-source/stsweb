import { useState } from "react";
import { apiRequest } from "../lib/api.js";

export default function QRGenerator({ token, lang = "es" }) {
  const [formData, setFormData] = useState({
    equipmentType: "failure",
    equipmentId: "",
    serial: "",
    refCode: ""
  });
  const [qrResult, setQrResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const copy = {
    es: {
      title: "Generador de Códigos QR",
      subtitle: "Genera QR para tus equipos",
      equipmentType: "Tipo de Equipo",
      equipmentId: "ID del Equipo",
      serial: "Serial",
      refCode: "Código de Referencia",
      generate: "Generar QR",
      download: "Descargar QR",
      print: "Imprimir",
      newQR: "Generar Otro",
      types: {
        failure: "Incidencia",
        spare: "Repuesto",
        purchase: "Compra"
      }
    },
    en: {
      title: "QR Code Generator",
      subtitle: "Generate QR for your equipment",
      equipmentType: "Equipment Type",
      equipmentId: "Equipment ID",
      serial: "Serial",
      refCode: "Reference Code",
      generate: "Generate QR",
      download: "Download QR",
      print: "Print",
      newQR: "Generate Another",
      types: {
        failure: "Failure",
        spare: "Spare",
        purchase: "Purchase"
      }
    }
  };

  const t = copy[lang] || copy.es;

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setQrResult(null);

    try {
      const result = await apiRequest("/api/qr/generate", "POST", formData, token);
      setQrResult(result);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!qrResult) return;
    
    const link = document.createElement("a");
    link.href = qrResult.qrImageUrl;
    link.download = `QR-${qrResult.qrCode}.png`;
    link.click();
  }

  function handlePrint() {
    if (!qrResult) return;
    
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${qrResult.qrCode}</title>
          <style>
            body { 
              font-family: Arial; 
              text-align: center; 
              padding: 40px;
            }
            img { 
              max-width: 400px; 
              border: 2px solid #006BAB;
              padding: 20px;
              margin: 20px 0;
            }
            h1 { color: #006BAB; }
            .code { 
              font-family: monospace; 
              background: #f5f5f5; 
              padding: 10px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <h1>SWARCO Traffic Spain</h1>
          <h2>Código QR del Equipo</h2>
          <img src="${qrResult.qrImageUrl}" alt="QR Code" />
          <div class="code">${qrResult.qrCode}</div>
          <p><strong>Serial:</strong> ${qrResult.serial || "-"}</p>
          <p><strong>Ref:</strong> ${qrResult.refCode || "-"}</p>
          <p><strong>Generado:</strong> ${new Date(qrResult.generatedAt).toLocaleString("es-ES")}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  function reset() {
    setQrResult(null);
    setFormData({
      equipmentType: "failure",
      equipmentId: "",
      serial: "",
      refCode: ""
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-swarcoBlue">{t.title}</h2>
        <p className="text-slate-600 text-sm">{t.subtitle}</p>
      </div>

      {!qrResult ? (
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t.equipmentType}
            </label>
            <select
              value={formData.equipmentType}
              onChange={(e) => setFormData(prev => ({ ...prev, equipmentType: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            >
              <option value="failure">{t.types.failure}</option>
              <option value="spare">{t.types.spare}</option>
              <option value="purchase">{t.types.purchase}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t.equipmentId}
            </label>
            <input
              type="number"
              value={formData.equipmentId}
              onChange={(e) => setFormData(prev => ({ ...prev, equipmentId: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t.serial}
            </label>
            <input
              type="text"
              value={formData.serial}
              onChange={(e) => setFormData(prev => ({ ...prev, serial: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder="123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t.refCode}
            </label>
            <input
              type="text"
              value={formData.refCode}
              onChange={(e) => setFormData(prev => ({ ...prev, refCode: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder="PN123A"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-swarcoBlue text-white rounded-lg hover:bg-swarcoBlue/90 disabled:opacity-50"
          >
            {loading ? "Generando..." : t.generate}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {/* QR Image */}
          <div className="text-center">
            <img
              src={qrResult.qrImageUrl}
              alt="QR Code"
              className="mx-auto border-4 border-swarcoBlue p-4 rounded-lg"
            />
          </div>

          {/* QR Code */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Código QR:</p>
            <p className="font-mono text-sm text-slate-900 break-all">{qrResult.qrCode}</p>
          </div>

          {/* Equipment Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500">Tipo:</span>
              <span className="ml-2 font-medium">{t.types[qrResult.equipmentType]}</span>
            </div>
            <div>
              <span className="text-slate-500">ID:</span>
              <span className="ml-2 font-medium">{qrResult.equipmentId}</span>
            </div>
            {qrResult.serial && (
              <div>
                <span className="text-slate-500">Serial:</span>
                <span className="ml-2 font-medium">{qrResult.serial}</span>
              </div>
            )}
            {qrResult.refCode && (
              <div>
                <span className="text-slate-500">Ref:</span>
                <span className="ml-2 font-medium">{qrResult.refCode}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 py-2 bg-swarcoBlue text-white rounded-lg hover:bg-swarcoBlue/90 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t.download}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2 bg-swarcoOrange text-white rounded-lg hover:bg-swarcoOrange/90 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {t.print}
            </button>
          </div>

          <button
            onClick={reset}
            className="w-full py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            {t.newQR}
          </button>
        </div>
      )}
    </div>
  );
}
