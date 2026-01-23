import { useState, useEffect } from "react";

export default function PhotoGallery({ photos = [], videos = [], lang = "es" }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState(new Set());

  const copy = {
    es: {
      photos: "Fotos",
      videos: "Videos",
      noPhotos: "Sin fotos adjuntas",
      noVideos: "Sin videos adjuntos",
      close: "Cerrar",
      previous: "Anterior",
      next: "Siguiente",
      download: "Descargar",
      of: "de"
    },
    en: {
      photos: "Photos",
      videos: "Videos",
      noPhotos: "No photos attached",
      noVideos: "No videos attached",
      close: "Close",
      previous: "Previous",
      next: "Next",
      download: "Download",
      of: "of"
    }
  };

  const t = copy[lang] || copy.es;

  function openLightbox(index) {
    setCurrentIndex(index);
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

  function previousPhoto() {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }

  function nextPhoto() {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }

  function getThumbnailUrl(photo) {
    // Si la URL contiene thumbnailUrl, usarla, sino usar la original
    if (typeof photo === 'object' && photo.thumbnailUrl) {
      return photo.thumbnailUrl;
    }
    // Si es un string, extraer la URL del thumbnail si existe
    const photoUrl = typeof photo === 'string' ? photo : photo.url;
    if (photoUrl && photoUrl.includes('/')) {
      const parts = photoUrl.split('/');
      const filename = parts[parts.length - 1];
      parts[parts.length - 1] = `thumbnails/${filename.replace(/(\.\w+)$/, '-thumb$1')}`;
      return parts.join('/');
    }
    return photoUrl;
  }

  function getFullUrl(photo) {
    return typeof photo === 'string' ? photo : photo.url;
  }

  function handleImageLoad(index) {
    setLoadedImages(prev => new Set(prev).add(index));
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-sm text-slate-500 italic">{t.noPhotos}</div>
    );
  }

  return (
    <>
      {/* Galería de miniaturas */}
      <div className="space-y-4">
        {photos.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-swarcoBlue">
                <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 14l3-3 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="9" cy="9" r="1.5" fill="currentColor" />
              </svg>
              {t.photos} ({photos.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => openLightbox(index)}
                  className="relative group cursor-pointer rounded-lg overflow-hidden border border-slate-200 hover:border-swarcoBlue transition-all"
                >
                  {!loadedImages.has(index) && (
                    <div className="absolute inset-0 bg-slate-100 animate-pulse" />
                  )}
                  <img
                    src={getThumbnailUrl(photo)}
                    alt={`Foto ${index + 1}`}
                    loading="lazy"
                    onLoad={() => handleImageLoad(index)}
                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {videos && videos.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-swarcoBlue">
                <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 9l5 3-5 3V9z" fill="currentColor" />
              </svg>
              {t.videos} ({videos.length})
            </h4>
            <div className="space-y-2">
              {videos.map((video, index) => (
                <video key={index} controls className="w-full max-w-md rounded-lg border border-slate-200">
                  <source src={video} type="video/mp4" />
                  Tu navegador no soporta la reproducción de video.
                </video>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox para ver fotos en tamaño completo */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={closeLightbox}>
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-swarcoOrange"
            onClick={closeLightbox}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Foto actual */}
          <div className="relative max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={getFullUrl(photos[currentIndex])}
              alt={`Foto ${currentIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />

            {/* Contador */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              {currentIndex + 1} {t.of} {photos.length}
            </div>

            {/* Botón descargar */}
            <a
              href={getFullUrl(photos[currentIndex])}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 bg-swarcoBlue text-white px-3 py-2 rounded-lg text-sm hover:bg-swarcoBlue/90 flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t.download}
            </a>
          </div>

          {/* Navegación */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  previousPhoto();
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
