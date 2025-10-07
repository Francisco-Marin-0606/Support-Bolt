"use client";

import Alert from "@/components/alert/Alert";
import { ConfirmModal, Modal } from "@/components/modal/Modal";
import CopyText from "@/components/ui/CopyText";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/table/EmptyState";
import GridDataView, { Column } from "@/components/ui/table/GridDataView";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

// Importaciones refactorizadas
import {
  filterUniqueAudiosByAttempt,
  getTextoCorregidoDesdeGuion,
  prepareGridData
} from "@/app/services/audioDetailService";
import { TABS, TabId } from "@/app/types/audioDetail";
import { formatDateUTC, formatTime } from "@/app/utils/audioDetailUtils";
import { AudioHeader } from "@/components/ui/AudioHeader";
import { QuestionsAnswers } from "@/components/ui/QuestionsAnswers";
import { ScriptSection } from "@/components/ui/ScriptSection";
import { Tab } from "@/components/ui/Tab";
import { UserInfo } from "@/components/ui/UserInfo";
import { useAudioDetail } from "@/hooks/useAudioDetail";
import { useRetryLogic } from "@/hooks/useRetryLogic";

export default function AudioDetailPage() {
  const params = useParams();
  const audioId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabId>("errors");

  // Hook principal para manejo de estado
  const {
    audioData,
    audio,
    user,
    loading,
    isAccelerating,
    isUpdatingTranscription,
    editingSections,
    historyAudios,
    loadingHistory,
    isEditModalOpen,
    editingAudioData,
    showGlobalReprocessModal,
    reprocessLoading,
    retryData,
    alertState,
    correccionesManuales,
    erroresAudiosOriginales,
    audiosCorrregidosManualmente,
    times,
    setEditingSections,
    setIsEditModalOpen,
    setEditingAudioData,
    setShowGlobalReprocessModal,
    setRetryData,
    setIsUpdatingTranscription,
    setAudiosCorrregidosManualmente,
    setAudioData,
    handleBackNavigation,
    fetchHistory,
    handleAccelerate,
    confirmGlobalReprocess,
    refreshData,
    showAlert,
    invalidateAudiosQueries,
  } = useAudioDetail(audioId);

  // Hook para lógica de retry
  const {
    updateRetryStructure,
    removeFromRetry,
    toggleTextRegen,
    toggleRemakeAll,
    getTextRetryState,
  } = useRetryLogic(retryData, setRetryData);

  // Función global para re-procesar
  const handleGlobalReprocess = () => {
    setShowGlobalReprocessModal(true);
  };

  // Cargar historial cuando se cambia a la pestaña
  useEffect(() => {
    if (activeTab === "history" && user?._id) {
      fetchHistory();
    }
  }, [activeTab, user?._id, fetchHistory]);

  const columns: Column<any>[] = [
    {
      field: "status",
      header: "STATUS",
      render: (value) => <StatusBadge status={value as string} />,
    },
    {
      field: "userLevel ",
      header: "NIVEL",
      render: (value, row) => {
        if (row.userLevel && typeof row.userLevel === "string") {
          return <div className="text-[16px]">Nivel {row.userLevel}</div>;
        }
        return <div className="font-medium">Sin nivel</div>;
      },
    },
    {
      field: "requestDate",
      header: "FECHA DE PEDIDO",
      render: (value) => (
        <CopyText
          text={`${formatDateUTC(value as string)}`}
          className="text-base font-medium flex items-center gap-[5px]"
          iconClassName="hidden"
          color="text-black"
        />
      ),
    },
    {
      field: "publicationDate",
      header: "FECHA DE ENTREGA",
      render: (value) => (
        <CopyText
          text={`${formatDateUTC(value as string)}`}
          className="text-base font-medium flex items-center gap-[5px]"
          iconClassName="hidden"
          color="text-black"
        />
      ),
    },
    {
      field: "audioUrlPlay",
      header: "AUDIO",
      render: (value, row) => {
        if (value && typeof value === "string" && value !== "") {
          return (
            <div
              className="h-[40px] w-[300px] rounded-[30px] bg-gray-100 flex items-center mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <AudioPlayer
                src={value as string}
                showJumpControls={false}
                showFilledVolume={false}
                autoPlayAfterSrcChange={false}
                autoPlay={false}
                layout="horizontal-reverse"
                customControlsSection={[
                  RHAP_UI.MAIN_CONTROLS,
                  RHAP_UI.PROGRESS_BAR,
                ]}
                customProgressBarSection={[
                  RHAP_UI.CURRENT_TIME,
                  <div key="separator" className="mx-1">
                    /
                  </div>,
                  RHAP_UI.DURATION,
                  RHAP_UI.VOLUME_CONTROLS,
                ]}
                customIcons={{
                  play: (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ),
                  pause: (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ),
                  volume: (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                    </svg>
                  ),
                  volumeMute: (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 9v6h4l5 5V4l-5 5H7z" />
                    </svg>
                  ),
                }}
                style={{
                  background: "transparent",
                  boxShadow: "none",
                }}
                className="audio-player-custom"
              />
            </div>
          );
        } else {
          return (
            <div className="" onClick={(e) => e.stopPropagation()}>
              <div className="text-gray-500 text-sm">Sin audio</div>
            </div>
          );
        }
      },
    },
    {
      field: "audioUrl",
      header: "URL",
      render: (value) => (
        <button
          className="text-blue-500 hover:text-blue-700 font-medium"
          onClick={(e) => {
            e.stopPropagation();
            if (value && typeof value === "string") {
              navigator.clipboard.writeText(
                (value as string) || "https://mentalmagnet.com"
              );
            }
          }}
        >
          Copiar URL
        </button>
      ),
    },
  ];

  // Preparar los datos para el grid
  const gridData = prepareGridData(audioData, audio);

  // Obtener último errorStatus para resaltar guión
  const lastErrorStatus = (audioData?.errorStatus && audioData.errorStatus.length > 0)
    ? audioData.errorStatus[audioData.errorStatus.length - 1]
    : null;
  const errorSectionId = (lastErrorStatus?.additionalInfo?.section?.sectionID ?? lastErrorStatus?.additionalInfo?.failedSection?.sectionID ?? null) as number | null;
  const failedAudioIds = (lastErrorStatus?.additionalInfo?.failedAudios || [])
    .map((f: any) => f?.audio?.audioID)
    .filter((n: any) => typeof n === "number");

  // Construir estructura de errores con la nueva lógica (fallback a la anterior si no hay datos estructurados)
  const computeAudioN = (sectionIndex: number, audioIndexZeroBased: number) => {
    let audioInicio = 1;
    for (let i = 0; i < (audioData?.audioMotive?.generatedSections?.length || 0) && i < sectionIndex; i++) {
      audioInicio += audioData?.audioMotive?.generatedSections?.[i]?.texts?.length || 0;
    }
    return audioInicio + audioIndexZeroBased;
  };

  const bloquesErrores = (() => {
    const failed = lastErrorStatus?.additionalInfo?.failedAudios;
    const sectionIdx = (errorSectionId ?? -1) as number;

    if (
      failed && Array.isArray(failed) && failed.length > 0 &&
      sectionIdx >= 0 &&
      audioData?.audioMotive?.generatedSections &&
      audioData.audioMotive.generatedSections.length > 0
    ) {
      const audios = failed.map((item: any) => {
        const audioObj = item?.audio || {};
        const audioIdOneBased = typeof audioObj.audioID === 'number' ? audioObj.audioID : 1;
        const audioN = computeAudioN(sectionIdx, Math.max(0, audioIdOneBased - 1));
        const script = (audioObj?.text ?? getTextoCorregidoDesdeGuion(audioData, audioN) ?? "");
        const transcription = (audioObj?.transcription ?? audioObj?.text ?? "");
        return { audioN, script, transcription };
      });

      return [{ audios, bloqueIdx: 0 }];
    }

    // Fallback: lógica anterior basada en parsing de texto
    return filterUniqueAudiosByAttempt(erroresAudiosOriginales);
  })();

  // Columnas para el historial
  const historyColumns: Column<any>[] = [
    {
      field: "audioMotive",
      header: "NOMBRE",
      render: (value, row) => (
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
          <div className="w-8 h-8 rounded-md overflow-hidden">
            {row.imageUrl && (
              <img
                src={row.imageUrl || "/play.svg"}
                alt="Audio thumbnail"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <div className="font-bold text-[16px] text-left">
              {row.title || "-"}
            </div>
            <CopyText
              text={`${row.id}`}
              className="cursor-pointer flex items-center gap-[5px] text-[12px] font-medium text-left"
              iconClassName="w-[12px] h-[12px]"
              color="text-gray-500"
            />
          </div>
        </div>
      ),
    },
    {
      field: "status",
      header: "STATUS",
      render: (value) => <StatusBadge status={value as string} />,
    },
    {
      field: "settings",
      header: "NIVEL",
      render: (value, row) => {
        if (row.userLevel && typeof row.userLevel === "string") {
          return <div className="font-medium">Nivel{row.userLevel}</div>;
        }
        return <div className="font-medium">Sin nivel</div>;
      },
    },
    {
      field: "requestDate",
      header: "FECHA DE PEDIDO",
      render: (value) => (
        <CopyText
          text={`${formatDateUTC(value as string)}`}
          className="text-base font-medium flex items-center gap-[5px]"
          iconClassName="w-[15px] h-[15px]"
          color="text-black"
        />
      ),
    },
    {
      field: "publicationDate",
      header: "FECHA DE ENTREGA",
      render: (value) => (
        <CopyText
          text={`${formatDateUTC(value as string)}`}
          className="text-base font-medium flex items-center gap-[5px]"
          iconClassName="w-[15px] h-[15px] text-black"
        />
      ),
    },
    {
      field: "audioUrlPlay",
      header: "AUDIO",
      render: (value) => {
        if (value && typeof value === "string" && value !== "") {
          return (
            <div
              className="h-[40px] w-[300px] rounded-[30px] bg-gray-100 flex items-center mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <AudioPlayer
                src={value as string}
                showJumpControls={false}
                showFilledVolume={false}
                autoPlayAfterSrcChange={false}
                autoPlay={false}
                layout="horizontal-reverse"
                customControlsSection={[
                  RHAP_UI.MAIN_CONTROLS,
                  RHAP_UI.PROGRESS_BAR,
                ]}
                customProgressBarSection={[
                  RHAP_UI.CURRENT_TIME,
                  <div key="separator" className="mx-1">
                    /
                  </div>,
                  RHAP_UI.DURATION,
                  RHAP_UI.VOLUME_CONTROLS,
                ]}
                customIcons={{
                  play: (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ),
                  pause: (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ),
                  volume: (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                    </svg>
                  ),
                  volumeMute: (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 9v6h4l5 5V4l-5 5H7z" />
                    </svg>
                  ),
                }}
                style={{
                  background: "transparent",
                  boxShadow: "none",
                }}
                className="audio-player-custom"
              />
            </div>
          );
        } else {
          return (
            <div className="" onClick={(e) => e.stopPropagation()}>
              <div className="text-gray-500 text-sm">Sin audio</div>
            </div>
          );
        }
      },
    },
    {
      field: "audioUrl",
      header: "URL",
      render: (value) => (
        <button
          className="text-blue-500 hover:text-blue-700 font-medium"
          onClick={(e) => {
            e.stopPropagation();
            if (value && typeof value === "string") {
              navigator.clipboard.writeText(
                (value as string) || "https://mentalmagnet.com"
              );
            }
          }}
        >
          Copiar URL
        </button>
      ),
    },
  ];

  const handleHistoryNewTab = (item: any) => {
    window.open(
      window.location.href.split("/").slice(0, -1).join("/") +
        `/${item.id || item._id}`,
      "_blank"
    );
  };

  const handleHistoryRowClick = (row: any) => {
    window.location.href = `/audio/${row.id}`;
  };


  // Función de confirmación de edición de transcripción
  const handleEditTranslation = async () => {
    if (!editingAudioData || !audioData) return;
    
    
    const audioNumMatch = editingAudioData.audioNumber.match(/Audio N°(\d+)/);
    const audioNumber = audioNumMatch ? parseInt(audioNumMatch[1]) : null;
    
    if (!audioNumber) return;

    
    setIsUpdatingTranscription(audioNumber);
    setIsEditModalOpen(false);
    setEditingAudioData(null);
    
    try {
      const newAudioData = JSON.parse(JSON.stringify(audioData));

      if (audioNumber && newAudioData?.audioMotive?.generatedSections) {
        let audioInicio = 1;
        let encontrado = false;
        
        for (let i = 0; i < newAudioData.audioMotive.generatedSections.length && !encontrado; i++) {
          const generatedSection = newAudioData.audioMotive.generatedSections[i];
          
          if (generatedSection.texts && Array.isArray(generatedSection.texts)) {
            const audioFin = audioInicio + generatedSection.texts.length - 1;
            
            if (audioNumber >= audioInicio && audioNumber <= audioFin) {
              const textoIndex = audioNumber - audioInicio;
              const originalText = generatedSection.texts[textoIndex];
              generatedSection.texts[textoIndex] = editingAudioData.currentText;
              
              
              updateRetryStructure(i, textoIndex, editingAudioData.currentText, originalText);
              
              setAudiosCorrregidosManualmente(prev => new Set(prev).add(audioNumber));
              
              encontrado = true;
              break;
            }
            
            audioInicio = audioFin + 1;
          }
        }
        
        if (!encontrado) {
          console.error(`❌ No se encontró el Audio N°${audioNumber} en audioMotive.generatedSections`);
        }
      }

      // Sin solicitudes: solo actualiza estado local
      setAudioData(newAudioData);
      showAlert("success", "Transcripción corregida");
      
    } catch (error) {
      console.error("❌ Error al actualizar:", error);
      const message = error instanceof Error ? error.message : String(error);
      showAlert("error", "Error al actualizar la transcripción: " + message);
    } finally {
      setIsUpdatingTranscription(null);
    }
  };

  // Función para resaltar diferencias entre dos textos usando algoritmo de diff
  const highlightDifferences = (original: string, transcription: string) => {
    // Función auxiliar para normalizar palabras (eliminar puntuación y convertir a minúsculas)
    const normalizeWord = (word: string) => {
      return word.toLowerCase().replace(/[.,;:!?¿¡"""'`()[\]{}…-]/g, '');
    };
    
    // Separar en palabras (sin espacios)
    const originalWords = original.split(/\s+/).filter(w => w.length > 0);
    const transcriptionWords = transcription.split(/\s+/).filter(w => w.length > 0);
    
    // Algoritmo de diff simple (LCS - Longest Common Subsequence)
    const lcsMatrix: number[][] = [];
    for (let i = 0; i <= originalWords.length; i++) {
      lcsMatrix[i] = [];
      for (let j = 0; j <= transcriptionWords.length; j++) {
        if (i === 0 || j === 0) {
          lcsMatrix[i][j] = 0;
        } else if (normalizeWord(originalWords[i - 1]) === normalizeWord(transcriptionWords[j - 1])) {
          lcsMatrix[i][j] = lcsMatrix[i - 1][j - 1] + 1;
        } else {
          lcsMatrix[i][j] = Math.max(lcsMatrix[i - 1][j], lcsMatrix[i][j - 1]);
        }
      }
    }
    
    // Reconstruir las diferencias
    const originalDiffs: Array<{ word: string; isDiff: boolean }> = [];
    const transcriptionDiffs: Array<{ word: string; isDiff: boolean }> = [];
    
    let i = originalWords.length;
    let j = transcriptionWords.length;
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && normalizeWord(originalWords[i - 1]) === normalizeWord(transcriptionWords[j - 1])) {
        originalDiffs.unshift({ word: originalWords[i - 1], isDiff: false });
        transcriptionDiffs.unshift({ word: transcriptionWords[j - 1], isDiff: false });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || lcsMatrix[i][j - 1] >= lcsMatrix[i - 1][j])) {
        transcriptionDiffs.unshift({ word: transcriptionWords[j - 1], isDiff: true });
        j--;
      } else if (i > 0) {
        originalDiffs.unshift({ word: originalWords[i - 1], isDiff: true });
        i--;
      }
    }
    
    // Renderizar con resaltado agrupado
    const renderWithHighlight = (diffs: Array<{ word: string; isDiff: boolean }>, color: string, bgColor: string) => {
      const result: React.JSX.Element[] = [];
      let currentGroup: string[] = [];
      let groupStartIdx = 0;
      
      diffs.forEach((item, idx) => {
        if (item.isDiff) {
          if (currentGroup.length === 0) {
            groupStartIdx = idx;
          }
          currentGroup.push(item.word);
        } else {
          if (currentGroup.length > 0) {
            result.push(
              <span 
                key={`diff-${groupStartIdx}`}
                style={{ 
                  color, 
                  fontWeight: 600,
                  backgroundColor: bgColor,
                  padding: '2px 3px',
                  borderRadius: '4px'
                }}
              >
                {currentGroup.join(' ')}
              </span>
            );
            currentGroup = [];
          }
          result.push(<span key={`normal-${idx}`}> {item.word}</span>);
        }
      });
      
      // Añadir el último grupo si existe
      if (currentGroup.length > 0) {
        result.push(
          <span 
            key={`diff-${groupStartIdx}`}
            style={{ 
              color, 
              fontWeight: 600,
              backgroundColor: bgColor,
              padding: '2px 3px',
              borderRadius: '4px'
            }}
          >
            {currentGroup.join(' ')}
          </span>
        );
      }
      
      return result;
    };
    
    const originalResult = renderWithHighlight(originalDiffs, '#f9c515', 'rgba(249, 197, 21, 0.3)');
    const transcriptionResult = renderWithHighlight(transcriptionDiffs, '#f76666', 'rgba(247, 102, 102, 0.3)');
    
    return { originalResult, transcriptionResult };
  };

  // Función para abrir el modal de edición
  const handleOpenEditModal = (
    audioNumber: string,
    originalScript: string,
    transcription: string,
    blockIndex: number
  ) => {
    setEditingAudioData({
      blockIndex: blockIndex,
      originalScript,
      transcription,
      currentText: transcription,
      audioNumber,
    });
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!audioData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Audio no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Alert */}
      {alertState?.show && (
        <div className="fixed top-4 right-4 z-[9999] w-96">
          <Alert
            variant={alertState.type}
            title={alertState.type === "success" ? "¡Éxito!" : "Error"}
            description={alertState.message}
            onClose={() => {}}
          />
        </div>
      )}

      {/* Contenido original */}
      <div className="px-1 mb-1">
        <button
          onClick={handleBackNavigation}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver
        </button>
      </div>

      <div className="flex gap-4 mt-4">
        {/* Sección Principal (90%) */}
        <div className="items-start flex-col w-[100%]">
          {/* Encabezado con imagen y datos */}
          <AudioHeader 
            audio={audio}
            audioData={audioData}
            isAccelerating={isAccelerating}
            onAccelerate={handleAccelerate}
          />

          <div className="flex-col mt-6 items-center">
            <label className="text-lg font-bold">Información</label>
            <div className="flex gap-4 bg-black h-[2px] w-[100px]" />
          </div>

          {/* Contenido principal usando GridDataView */}
          <div className="space-y-6 mt-6">
            <div className="bg-white rounded-[20px] overflow-hidden p-1">
              <GridDataView
                data={gridData}
                columns={columns}
                showSearch={false}
                isLoading={loading}
              />
            </div>
          </div>
        </div>

        {/* Sección Lateral - Información del Usuario (20%) */}
        <UserInfo user={user} />
      </div>

      <div id="tabs-section" className="border-b border-gray-200 mt-10">
        <div className="flex gap-">
          {TABS.map((tab) => (
            <Tab
              key={tab.id}
              label={tab.label}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
            />
          ))}
        </div>
      </div>

      {/* Formulario */}
      {activeTab === "questions-answers" && audioData && (
        <QuestionsAnswers audioData={audioData} audio={audio} />
      )}

      {activeTab === "script" && (
        <div className="mt-6 space-y-6">
          {/* Botones de acción */}
          <div className="flex justify-end gap-3 mb-4">
            <button
              className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              onClick={refreshData}
              disabled={loading}
            >
              {loading ? "Actualizando..." : "Actualizar Datos"}
            </button>
            <button
              className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              onClick={handleGlobalReprocess}
            >
              Re-Procesar
            </button>
          </div>
          {audioData?.audioMotive?.generatedSections &&
          audioData?.audioMotive?.generatedSections.length > 0 &&
          audioData?.settings?.exportSettings?.sections &&
          audioData?.settings?.exportSettings?.sections.length > 0 ? (
            audioData?.audioMotive?.generatedSections?.map((item, index) => (
              <ScriptSection
                key={`section-${index}`}
                script={item.texts}
                time={`${formatTime(
                  audioData?.settings?.exportSettings?.sections[index]
                    .timeStart || 0
                )} - ${formatTime(
                  audioData?.settings?.exportSettings?.sections[index]
                    .timeEnd || 0
                )}`}
                index={index}
                correcciones={correccionesManuales}
                audioData={audioData}
                audioId={audioId}
                audioUrl={audio?.audioUrl}
                retryData={retryData}
                audiosCorrregidosManualmente={audiosCorrregidosManualmente}
                times={times}
                onSave={invalidateAudiosQueries}
                onUpdateRetry={updateRetryStructure}
                onRemoveFromRetry={removeFromRetry}
                onToggleTextRegen={toggleTextRegen}
                onToggleRemakeAll={toggleRemakeAll}
                getTextRetryState={(textIndex: number) => getTextRetryState(index, textIndex)}
                showAlert={showAlert}
                editingSections={editingSections}
                setEditingSections={setEditingSections}
                errorSectionId={errorSectionId}
                failedAudioIds={index === errorSectionId ? failedAudioIds : []}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] bg-white rounded-[20px] p-8">
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg font-medium text-center">
                No se ha generado el guión de hipnosis
              </p>
              <p className="text-gray-400 text-sm mt-2 text-center">
                El guión aparecerá aquí una vez que se procese la solicitud
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "errors" && (
        <div className="mt-6 p-6 bg-white rounded-[20px]">
          {/* Header con botón re-procesar */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Errores de Transcripción
              </h2>
              <p className="text-gray-500">
                Corrige las transcripciones incorrectas
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="px-6 py-2 bg-black text-white rounded-lg font-medium mt-[2px] hover:bg-gray-800 transition-colors"
                onClick={handleGlobalReprocess}
              >
                Re-Procesar
              </button>
            </div>
          </div>

          {/* Renderizar lista de errores */}
          <div className="flex flex-col gap-6">
            {bloquesErrores.length > 0 ? (
              <>
                {bloquesErrores.map(({ audios, bloqueIdx }) => (
                  <div
                    key={bloqueIdx}
                    className={`bg-white p-8 rounded-[20px]${
                      bloqueIdx === bloquesErrores.length - 1 ? "" : " mb-8"
                    }`}
                  >
                    {audios.map((item: any, idx: number) => {
                      const fueCorregidoManualmente = audiosCorrregidosManualmente.has(item.audioN);
                      const textoCorregido = fueCorregidoManualmente ? getTextoCorregidoDesdeGuion(audioData, item.audioN) : null;
                      const estaActualizandose = isUpdatingTranscription === item.audioN;

                      return (
                        <div key={idx} className="border-l-4 border-gray-200 pl-4 p-2 mb-4">
                          {estaActualizandose ? (
                            <div className="animate-pulse">
                              <div className="flex items-center gap-4 mb-2">
                                <div className="h-6 bg-gray-200 rounded w-24"></div>
                                <div className="h-9 bg-gray-200 rounded w-16"></div>
                              </div>
                              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-4 mb-2">
                                <p className="font-bold text-[20px] m-0">
                                  Audio N°{item.audioN}
                                </p>
                                <button
                                  className={
                                    fueCorregidoManualmente
                                      ? "px-6 py-2 border-2 border-black rounded-lg font-medium text-base bg-white hover:bg-gray-100 transition-colors"
                                      : "px-6 py-2 border-2 border-black rounded-lg font-medium text-base bg-black text-white hover:bg-gray-900 transition-colors"
                                  }
                                  onClick={() =>
                                    handleOpenEditModal(
                                      `Audio N°${item.audioN}`,
                                      item.script,
                                      textoCorregido || item.transcription,
                                      idx
                                    )
                                  }
                                  disabled={estaActualizandose}
                                >
                                  {fueCorregidoManualmente ? "Volver a editar" : "Editar"}
                                </button>
                              </div>
                              {fueCorregidoManualmente && textoCorregido ? (
                                <>
                                  <p className="m-0">
                                    <span className="font-bold">Guion original:</span>{" "}
                                    {item.script}
                                  </p>
                                  <p className="m-0">
                                    <span className="font-bold">Transcripción:</span>{" "}
                                    <span className="text-green-700 font-medium">
                                      {textoCorregido}
                                    </span>
                                  </p>
                                </>
                              ) : (
                                (() => {
                                  const { originalResult, transcriptionResult } = highlightDifferences(
                                    item.script,
                                    item.transcription
                                  );
                                  return (
                                    <>
                                      <p className="m-0">
                                        <span className="font-bold">Guion original:</span>{" "}
                                        {originalResult}
                                      </p>
                                      <p className="m-0">
                                        <span className="font-bold">Transcripción:</span>{" "}
                                        {transcriptionResult}
                                      </p>
                                    </>
                                  );
                                })()
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </>
            ) : (
              <EmptyState
                title="No hay errores para mostrar"
                description="No se encontraron errores en el procesamiento de este audio."
              />
            )}
          </div>
        </div>
     /*    <h2 className="text-center text-gray-500 mt-6">Momentaneamente en mantenimiento. Usar pestaña de "Guión" mientras se solucionan algunos errores.</h2> */
      )}

      {activeTab === "history" && (
        <div className="mt-6">
          <div className="bg-white rounded-[20px] overflow-hidden">
            {loadingHistory ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-gray-500">Cargando historial...</div>
              </div>
            ) : historyAudios.length > 0 ? (
              <GridDataView
                data={historyAudios}
                columns={historyColumns}
                showSearch={false}
                isLoading={loadingHistory}
                onRowClick={handleHistoryRowClick}
                onNewTab={handleHistoryNewTab}
              />
            ) : (
              <EmptyState
                title="No hay historial de hipnosis"
                description="Este usuario no tiene otras sesiones de hipnosis registradas."
              />
            )}
          </div>
        </div>
      )}

      {/* Estilos del reproductor de audio */}
      <style jsx global>{`
        .audio-player-custom .rhap_container {
          background: transparent;
          box-shadow: none;
          padding: 0;
          min-width: auto;
          width: 100%;
        }
        .audio-player-custom .rhap_main-controls-button {
          color: #374151;
          transition: color 0.2s;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .audio-player-custom .rhap_main-controls-button:hover {
          color: #1a56db;
        }
        .audio-player-custom .rhap_progress-filled {
          background-color: #1a56db;
        }
        .audio-player-custom .rhap_progress-indicator {
          display: none;
        }
        .audio-player-custom .rhap_volume-button {
          color: #374151;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .audio-player-custom .rhap_volume-indicator {
          display: none;
        }
        .audio-player-custom .rhap_progress-bar {
          background: #e5e7eb;
          height: 4px;
          border-radius: 2px;
        }
        .audio-player-custom .rhap_progress-bar-show-download {
          background-color: transparent;
        }
        .audio-player-custom .rhap_time {
          color: #374151;
          font-size: 0.75rem;
        }
        .audio-player-custom .rhap_volume-controls {
          justify-content: flex-end;
          margin-left: 10px;
        }
        .audio-player-custom .rhap_volume-bar {
          display: none;
        }
        .audio-player-custom .rhap_main {
          flex: 0;
        }
        .audio-player-custom .rhap_progress-section {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .audio-player-custom .rhap_total-time {
          margin-left: 0;
        }
        .audio-player-custom .rhap_current-time {
          margin-right: 0;
        }
        .audio-player-custom .rhap_controls-section {
          margin: 0;
        }
        .audio-player-custom .rhap_additional-controls {
          display: none;
        }
        .audio-player-custom .rhap_play-pause-button {
          font-size: 24px;
        }
        .audio-player-custom .rhap_progress-container {
          flex: 1;
        }
        .audio-player-custom .rhap_main-controls {
          margin-right: 8px;
        }
      `}</style>

      {/* Modal de edición */}
      {isEditModalOpen && editingAudioData && (
        <Modal onClose={() => setIsEditModalOpen(false)}>
          <div className=" text-white p-8 rounded-lg w-full mx-4">
            <div className="mb-4">
              <p className="text-sm mb-0">
                <span className="font-bold">Guión original:</span>{" "}
                {editingAudioData.originalScript}
              </p>
              <p className="text-sm mb-2">
                <span className="font-bold">Transcripción:</span>{" "}
                {editingAudioData.transcription}
              </p>
            </div>

            <textarea
              value={editingAudioData.currentText}
              onChange={(e) =>
                setEditingAudioData({
                  ...editingAudioData,
                  currentText: e.target.value,
                })
              }
              className="w-full h-16 p-3 bg-white text-black rounded border border-gray-300 resize-none"
              placeholder="Corrige la transcripción aquí..."
            />

            <div className="flex justify-center gap-3 mt-2">
              <button
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isUpdatingTranscription !== null}
              >
                Cancelar
              </button>
              <button
                className="px-6 py-2 bg-white text-black rounded hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
                onClick={handleEditTranslation}
                disabled={isUpdatingTranscription !== null}
              >
                {isUpdatingTranscription !== null ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de confirmación para reprocesamiento global */}
      <ConfirmModal
        isOpen={showGlobalReprocessModal}
        onClose={() => setShowGlobalReprocessModal(false)}
        onConfirm={() => confirmGlobalReprocess(activeTab)}
        title="Confirmar Reprocesamiento"
        message="¿Estás seguro de que deseas re-procesar todo el audio? Esta acción no se puede deshacer."
        confirmText="Re-Procesar"
        loading={reprocessLoading}
      />

    </div>
  );
}
