import { useState } from "react";
import { apiRequest } from "../lib/api.js";

export default function FileUploader({
  token,
  folder = "general",
  acceptedTypes = "image/*,video/*",
  maxFiles = 4,
  maxSize = 5,
  onUploadComplete,
  onUploadError,
  onFileRemove,
  allowVideo = false,
  lang = "es"
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const copy = {
    es: {
      selectFiles: "Seleccionar archivos",
      uploading: "Subiendo",
      uploaded: "Subido",
      error: "Error",
      tooLarge: "Archivo muy grande",
      tooMany: `Máximo ${maxFiles} archivos`,
      invalidType: "Tipo de archivo no válido"
    },
    en: {
      selectFiles: "Select files",
      uploading: "Uploading",
      uploaded: "Uploaded",
      error: "Error",
      tooLarge: "File too large",
      tooMany: `Maximum ${maxFiles} files`,
      invalidType: "Invalid file type"
    }
  };

  const t = copy[lang] || copy.es;

  async function handleFileChange(event) {
    const files = Array.from(event.target.files || []);
    
    // Validar cantidad
    if (files.length > maxFiles) {
      if (onUploadError) onUploadError(t.tooMany);
      return;
    }

    // Validar tamaño
    const maxBytes = maxSize * 1024 * 1024;
    for (const file of files) {
      if (file.size > maxBytes) {
        if (onUploadError) onUploadError(`${file.name}: ${t.tooLarge} (${maxSize}MB)`);
        return;
      }
    }

    setUploading(true);
    const uploaded = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `${Date.now()}-${i}`;
      
      setProgress(prev => ({
        ...prev,
        [fileId]: { name: file.name, percent: 0, status: "uploading" }
      }));

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        // Simular progreso (ya que FormData no tiene progress real en fetch)
        const API_URL = import.meta.env.VITE_API_URL || "https://stsweb-backend-964379250608.europe-west1.run.app";
        const uploadPromise = fetch(`${API_URL}/api/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
            // NO incluir Content-Type - el navegador lo establece automáticamente con el boundary para FormData
          },
          body: formData
        }).then(async res => {
          if (!res.ok) {
            let errorData;
            try {
              errorData = await res.json();
            } catch {
              errorData = { error: `Error ${res.status}: ${res.statusText}` };
            }
            
            // Mensajes de error más específicos
            if (res.status === 401) {
              throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
            } else if (res.status === 403) {
              throw new Error("No tienes permisos para subir archivos.");
            } else if (res.status === 429) {
              throw new Error("Demasiadas solicitudes. Por favor, espera un momento.");
            } else if (res.status === 413) {
              throw new Error("El archivo es demasiado grande.");
            } else {
              throw new Error(errorData.error || `Error al subir archivo (${res.status})`);
            }
          }
          return res.json();
        });

        // Simular progreso visual
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            const current = prev[fileId]?.percent || 0;
            if (current < 90) {
              return {
                ...prev,
                [fileId]: { ...prev[fileId], percent: current + 10 }
              };
            }
            return prev;
          });
        }, 200);

        const result = await uploadPromise;
        clearInterval(progressInterval);

        if (result.success && result.file) {
          uploaded.push(result.file);
          setProgress(prev => ({
            ...prev,
            [fileId]: { name: file.name, percent: 100, status: "success" }
          }));
        } else {
          throw new Error(result.error || "Upload failed");
        }
      } catch (error) {
        console.error("Upload error:", error);
        const errorMessage = error.message || "Error desconocido al subir archivo";
        errors.push({ file: file.name, error: errorMessage });
        setProgress(prev => ({
          ...prev,
          [fileId]: { name: file.name, percent: 0, status: "error", error: errorMessage }
        }));
        
        // Si es error de autenticación, mostrar mensaje más claro
        if (errorMessage.includes("Sesión expirada") || errorMessage.includes("401")) {
          console.warn("⚠️ Token de autenticación inválido o expirado");
        }
      }
    }

    setUploading(false);
    setUploadedFiles(prev => [...prev, ...uploaded]);

    if (onUploadComplete && uploaded.length > 0) {
      onUploadComplete(uploaded);
    }

    if (onUploadError && errors.length > 0) {
      onUploadError(errors.map(e => `${e.file}: ${e.error}`).join(", "));
    }

    // Limpiar input
    event.target.value = "";
  }

  function removeFile(url) {
    const updatedFiles = uploadedFiles.filter(f => f.url !== url);
    setUploadedFiles(updatedFiles);
    
    // Notificar al padre que se eliminó un archivo
    if (onFileRemove) {
      onFileRemove(url);
    }
    
    // También notificar con la lista actualizada
    if (onUploadComplete) {
      onUploadComplete(updatedFiles);
    }
  }

  return (
    <div className="space-y-3">
      {/* Input de archivo */}
      <label className="block">
        <input
          type="file"
          accept={acceptedTypes}
          multiple={maxFiles > 1}
          onChange={handleFileChange}
          disabled={uploading}
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-swarcoBlue file:text-white hover:file:bg-swarcoBlue/90 disabled:opacity-50"
        />
      </label>

      {/* Progress bars */}
      {Object.keys(progress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(progress).map(([id, item]) => (
            <div key={id} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="truncate max-w-[200px]">{item.name}</span>
                <span className={`font-medium ${
                  item.status === "success" ? "text-green-600" :
                  item.status === "error" ? "text-red-600" :
                  "text-swarcoBlue"
                }`}>
                  {item.status === "success" ? t.uploaded :
                   item.status === "error" ? t.error :
                   `${item.percent}%`}
                </span>
              </div>
              {item.status === "uploading" && (
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-swarcoBlue transition-all duration-300"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              )}
              {item.status === "error" && item.error && (
                <p className="text-xs text-red-600">{item.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lista de archivos subidos */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {uploadedFiles.map((file, idx) => (
            <div key={idx} className="relative group">
              <img
                src={file.url}
                alt={file.originalName}
                className="h-20 w-full rounded border border-slate-200 object-cover"
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(file.url)}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
