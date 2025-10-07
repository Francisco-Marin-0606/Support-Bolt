import { MONTHS_ES } from "@/app/types/audioDetail";

// Utilidades para formateo de fechas y tiempo
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "-";
  return new Date(date).toLocaleString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const formatDateUTC = (dateString: string | undefined): string => {
  if (!dateString) return "Sin fecha";
  const date = new Date(dateString);
  return `${date.getUTCDate()} ${
    MONTHS_ES[date.getUTCMonth()]
  } ${date.getUTCFullYear()} ${String(date.getUTCHours()).padStart(
    2,
    "0"
  )}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
};

export const getMonthName = (month: number): string => {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  return months[month - 1];
};

// Utilidades para manejo de sesión
export const clearScriptSessionData = (audioId: string): void => {
  const keys = Object.keys(sessionStorage);
  const scriptKeys = keys.filter(key => 
    key.startsWith(`scriptEdit_${audioId}`) || key.startsWith(`isEditing_${audioId}`)
  );
  scriptKeys.forEach(key => sessionStorage.removeItem(key));
};

// Utilidades para validación de datos de retry
export const validateRetryData = (retryData: any): boolean => {
  if (!retryData) return true;
  
  for (const section of retryData.sections) {
    // Validación de sección
    if (section.remakeALL && section.texts.length > 0) {
      console.error(`❌ Sección ${section.sectionId}: Si remakeALL es true, texts debe estar vacío`);
      return false;
    }
    
    if (!section.remakeALL && section.texts.length === 0) {
      console.error(`❌ Sección ${section.sectionId}: Si remakeALL es false, texts no puede estar vacío`);
      return false;
    }
    
    // Validación de textos
    for (const text of section.texts) {
      if (!text.textToUse && !text.regen) {
        console.error(`❌ Texto ${text.index}: Si regen es false, textToUse no puede ser null`);
        return false;
      }
      
      if (text.textToUse && text.regen) {
        console.error(`❌ Texto ${text.index}: Si textToUse no es null, regen debe ser false`);
        return false;
      }
    }
  }
  
  return true;
};

// Utilidades para procesamiento de correcciones manuales
export const extractManualCorrections = (message: string): any[] => {
  const resultadoIndex = message.indexOf("Resultado de reintentos:");
  const correcionesExtraidas: any[] = [];

  if (resultadoIndex !== -1) {
    const resultadosSeccion = message.substring(resultadoIndex);
    const lineas = resultadosSeccion.split("\n");

    lineas.forEach((linea: string) => {
      const match = linea.match(/Audio N°(\d+) - SI \(CORRECCIÓN MANUAL\) -> "(.+)"/);
      if (match) {
        const audioN = parseInt(match[1]);
        const transcripcion = match[2];
        const nuevaCorreccion = {
          audioN: audioN,
          assistantResponse: "SI",
          transcription: transcripcion,
          script: transcripcion,
          attempt: 999,
          isManualCorrection: true,
        };
        correcionesExtraidas.push(nuevaCorreccion);
      }
    });
  }

  return correcionesExtraidas;
};

// Utilidad para procesar errores de audio
export const processAudioErrors = (message: string): { errors: any[], corrections: any[] } => {
  try {
    const corrections = extractManualCorrections(message);

    // Acotar zona de búsqueda (antes de "Resultado de reintentos:")
    let jsonZone = message;
    const resultadoIndex = message.indexOf("Resultado de reintentos:");
    if (resultadoIndex !== -1) {
      jsonZone = message.substring(0, resultadoIndex).trim();
    }

    // Buscar el primer bloque con { ... } o [ ... ]
    const firstBrace = jsonZone.search(/[\[{]/);
    if (firstBrace === -1) {
      return { errors: [], corrections };
    }

    const opening = jsonZone[firstBrace];
    const closing = opening === '[' ? ']' : '}';
    const lastClosing = jsonZone.lastIndexOf(closing);
    if (lastClosing === -1 || lastClosing <= firstBrace) {
      return { errors: [], corrections };
    }

    const jsonCandidate = jsonZone.substring(firstBrace, lastClosing + 1).trim();
    if (!jsonCandidate) {
      return { errors: [], corrections };
    }

    const parsed = JSON.parse(jsonCandidate);
    const bloques = Array.isArray(parsed) ? parsed : [parsed];
    const erroresFiltrados = bloques.map((bloque: any) => ({
      ...bloque,
      toRetry: bloque?.toRetry || []
    }));

    return { errors: erroresFiltrados, corrections };
  } catch (e) {
    console.error("No se pudo parsear el JSON de errores:", e);
    return { errors: [], corrections: [] };
  }
};
