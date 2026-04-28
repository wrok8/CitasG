import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { ref, onValue, update, remove } from "firebase/database";
import { db as firebaseDB } from "../firebaseConfig";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BarChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registrarMovimiento, initBitacora } from "../utils/bitacora";

const SCREEN_W = Dimensions.get("window").width - 32;
const USER_SELECTED = "@usuario_seleccionado";


const STATUS_CONFIG = {
  agendada:   { color: "#1565C0", bg: "#E3F2FD", label: " Agendada"   },
  "en curso": { color: "#E65100", bg: "#FFF3E0", label: " En Curso"   },
  concluida:  { color: "#2E7D32", bg: "#E8F5E9", label: " Concluida"  },
  cancelada:  { color: "#B71C1C", bg: "#FFEBEE", label: " Cancelada"  },
};

const TABS = ["Agenda", "Pacientes", "Gráficas", "Bitácora"];

// ──────────────────────────────────────────────────────────────────────────────

export default function ControlCitasScreen({ setScreen, pacienteActual }) {
  const [citas, setCitas]                 = useState([]);
  const [tab, setTab]                     = useState("Agenda");
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [modalVisible, setModalVisible]   = useState(false);
  const [modalReagendar, setModalReagendar] = useState(false);
  const [nuevaFecha, setNuevaFecha]       = useState(new Date());
  const [nuevaHora, setNuevaHora]         = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [busqueda, setBusqueda]           = useState("");
  const [usuarioActual, setUsuarioActual] = useState("Sistema");
  const [bitacora, setBitacora]           = useState([]);
  const [filtroStatus, setFiltroStatus]   = useState("todos");

  useEffect(() => {
    initBitacora();
    cargarUsuario();
    cargarCitas();
    cargarBitacora();
  }, []);



  const cargarUsuario = async () => {
    try {
      const data = await AsyncStorage.getItem(USER_SELECTED);
      if (data) setUsuarioActual(JSON.parse(data).nombre || "Sistema");
    } catch (_) {}
  };

  const cargarCitas = () => {
    const citasRef = ref(firebaseDB, "citasD");
    onValue(citasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.keys(data).map((key) => ({
          firebaseId: key,
          ...data[key],
        }));
     
        lista.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        setCitas(lista);
      } else {
        setCitas([]);
      }
    });
  };

  const cargarBitacora = async () => {
    const { obtenerBitacora } = await import("../utils/bitacora");
    const registros = await obtenerBitacora();
    setBitacora(registros);
  };


  const cambiarStatus = async (cita, nuevoStatus) => {
    try {
      await update(ref(firebaseDB, `citasD/${cita.firebaseId}`), {
        status: nuevoStatus,
        actualizadoEn: new Date().toISOString(),
      });
      await registrarMovimiento(
        usuarioActual,
        nuevoStatus === "cancelada" ? "cancela" : nuevoStatus,
        `Status de cita de ${cita.nombre} cambiado a "${nuevoStatus}"`
      );
      cargarBitacora();
    } catch (e) {
      Alert.alert("Error", "No se pudo actualizar el status");
    }
  };

  const guardarObservaciones = async () => {
    if (!citaSeleccionada) return;
    try {
      await update(ref(firebaseDB, `citasD/${citaSeleccionada.firebaseId}`), {
        observaciones,
        actualizadoEn: new Date().toISOString(),
      });
      await registrarMovimiento(
        usuarioActual,
        "observación",
        `Observaciones actualizadas para cita de ${citaSeleccionada.nombre}`
      );
      Alert.alert("", "Observaciones guardadas");
      setModalVisible(false);
      cargarBitacora();
    } catch (e) {
      Alert.alert("Error", "No se pudieron guardar las observaciones");
    }
  };

  const reagendarCita = async () => {
    if (!citaSeleccionada) return;
    const nuevaFechaISO = nuevaFecha.toISOString();
    const nuevaHoraStr  = nuevaHora.toLocaleTimeString("es-MX", {
      hour: "2-digit", minute: "2-digit",
    });
    try {
      await update(ref(firebaseDB, `citasD/${citaSeleccionada.firebaseId}`), {
        fecha:         nuevaFechaISO,
        hora:          nuevaHoraStr,
        status:        "agendada",
        actualizadoEn: new Date().toISOString(),
      });
      await registrarMovimiento(
        usuarioActual,
        "re-agenda",
        `Cita de ${citaSeleccionada.nombre} re-agendada para ${nuevaFecha.toLocaleDateString("es-MX")} ${nuevaHoraStr}`
      );
      Alert.alert("", "Cita re-agendada correctamente");
      setModalReagendar(false);
      cargarBitacora();
    } catch (e) {
      Alert.alert("Error", "No se pudo re-agendar la cita");
    }
  };


  const cancelarCita = (cita) => {
    Alert.alert(
      "Cancelar Cita",
      `¿Deseas cancelar la cita de ${cita.nombre}?`,
      [
        { text: "No" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: () => cambiarStatus(cita, "cancelada"),
        },
      ]
    );
  };



  const citasFiltradas = citas.filter((c) => {
    const matchBusqueda =
      c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.medico?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.centroGeriatrico?.toLowerCase().includes(busqueda.toLowerCase());
    const matchStatus = filtroStatus === "todos" || c.status === filtroStatus;
    return matchBusqueda && matchStatus;
  });

  const citasAgendadas = citas.filter(
    (c) => c.status === "agendada" || c.status === "en curso"
  );

  const agrupar = (campo) => {
    const mapa = {};
    citas.forEach((c) => {
      const key = c[campo] || "Sin datos";
      mapa[key] = (mapa[key] || 0) + 1;
    });
    const entries = Object.entries(mapa).slice(0, 6); 
    return {
      labels: entries.map(([k]) => k.length > 10 ? k.slice(0, 10) + "…" : k),
      datos:  entries.map(([, v]) => v),
    };
  };

  const grafCentro  = agrupar("centroGeriatrico");
  const grafMedico  = agrupar("medico");
  const grafPaciente = agrupar("nombre");



  return (
    <View style={s.root}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.tabBtn, tab === t && s.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

        {tab === "Agenda" && (
          <>
            

            {/* Filtros de status */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtrosRow}>
              {["todos", "agendada", "en curso", "concluida", "cancelada"].map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[s.filtroChip, filtroStatus === st && s.filtroChipActive]}
                  onPress={() => setFiltroStatus(st)}
                >
                  <Text style={[s.filtroTxt, filtroStatus === st && s.filtroTxtActive]}>
                    {st === "todos" ? "Todas" : STATUS_CONFIG[st]?.label ?? st}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {citasFiltradas.length === 0 ? (
              <EmptyState mensaje="No hay citas que coincidan con el filtro." />
            ) : (
              citasFiltradas.map((cita) => (
                <CitaCard
                  key={cita.firebaseId}
                  cita={cita}
                  onVerDetalle={() => {
                    setCitaSeleccionada(cita);
                    setObservaciones(cita.observaciones || "");
                    setModalVisible(true);
                  }}
                  onCambiarStatus={(st) => cambiarStatus(cita, st)}
                  onReagendar={() => {
                    setCitaSeleccionada(cita);
                    setNuevaFecha(new Date(cita.fecha));
                    setModalReagendar(true);
                  }}
                  onCancelar={() => cancelarCita(cita)}
                  setScreen={setScreen}
                />
              ))
            )}
          </>
        )}


        {tab === "Pacientes" && (
          <>
            <Text style={s.seccionTitulo}>
               Pacientes con citas agendadas ({citasAgendadas.length})
            </Text>

            {(() => {
              const porPaciente = {};
              citas.forEach((c) => {
                if (!porPaciente[c.nombre]) porPaciente[c.nombre] = [];
                porPaciente[c.nombre].push(c);
              });
              return Object.entries(porPaciente).map(([nombre, citasPac]) => (
                <View key={nombre} style={s.pacienteCard}>
                  <Text style={s.pacienteNombre}> {nombre}</Text>
                  <Text style={s.pacienteSub}>
                     {citasPac[0]?.telefono}   •   Total citas: {citasPac.length}
                  </Text>
                  <View style={s.pacienteStatusRow}>
                    {Object.entries(
                      citasPac.reduce((acc, c) => {
                        acc[c.status] = (acc[c.status] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([st, count]) => (
                      <View
                        key={st}
                        style={[s.pacienteStatusChip, { backgroundColor: STATUS_CONFIG[st]?.bg ?? "#eee" }]}
                      >
                        <Text style={{ color: STATUS_CONFIG[st]?.color ?? "#333", fontSize: 12, fontWeight: "700" }}>
                          {STATUS_CONFIG[st]?.label ?? st}: {count}
                        </Text>
                      </View>
                    ))}
                  </View>
                  {/* Mini historial */}
                  {citasPac.slice(0, 3).map((c) => (
                    <View key={c.firebaseId} style={s.historialItem}>
                      <Text style={s.historialFecha}>
                         {new Date(c.fecha).toLocaleDateString("es-MX")}  {c.hora}
                      </Text>
                      <Text style={s.historialMedico}> {c.medico || "—"}</Text>
                    </View>
                  ))}
                  {citasPac.length > 3 && (
                    <Text style={s.masHistorial}>+ {citasPac.length - 3} citas más…</Text>
                  )}
                </View>
              ));
            })()}
          </>
        )}


        {tab === "Gráficas" && (
          <>
            <Text style={s.seccionTitulo}> Densidad de Citas</Text>

            {citas.length === 0 ? (
              <EmptyState mensaje="No hay citas registradas para graficar." />
            ) : (
              <>
                <GraficaBarra
                  titulo="Por Centro Geriátrico"
                  labels={grafCentro.labels}
                  datos={grafCentro.datos}
                  color="#1565C0"
                />
                <GraficaBarra
                  titulo="Por Médico"
                  labels={grafMedico.labels}
                  datos={grafMedico.datos}
                  color="#6A1B9A"
                />
                <GraficaBarra
                  titulo="Por Paciente"
                  labels={grafPaciente.labels}
                  datos={grafPaciente.datos}
                  color="#E65100"
                />
              </>
            )}
          </>
        )}


        {tab === "Bitácora" && (
          <>
            <View style={s.bitacoraHeader}>
              <Text style={s.seccionTitulo}> Bitácora de Operaciones</Text>
              <TouchableOpacity onPress={cargarBitacora} style={s.btnRefresh}>
                <Text style={s.btnRefreshTxt}>↻ Actualizar</Text>
              </TouchableOpacity>
            </View>

            {bitacora.length === 0 ? (
              <EmptyState mensaje="No hay registros en la bitácora." />
            ) : (
              bitacora.map((b) => (
                <View key={b.id} style={s.bitacoraItem}>
                  <View style={s.bitacoraTop}>
                    <Text style={s.bitacoraMovimiento}>{iconMovimiento(b.movimiento)} {b.movimiento}</Text>
                    <Text style={s.bitacoraFecha}>{b.fecha}  {b.hora}</Text>
                  </View>
                  <Text style={s.bitacoraUsuario}> {b.usuario}</Text>
                  {b.detalle ? <Text style={s.bitacoraDetalle}>{b.detalle}</Text> : null}
                </View>
              ))
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>


      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView style={s.modalContainer} showsVerticalScrollIndicator={false}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitulo}> Detalle de Cita</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={s.modalCerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          {citaSeleccionada && (
            <>
              {/* Info básica */}
              <InfoRow label="Paciente"  value={citaSeleccionada.nombre} />
              <InfoRow label="Médico"    value={citaSeleccionada.medico} />
              <InfoRow label="Centro"    value={citaSeleccionada.centroGeriatrico} />
              <InfoRow label="Fecha"     value={new Date(citaSeleccionada.fecha).toLocaleDateString("es-MX")} />
              <InfoRow label="Hora"      value={citaSeleccionada.hora} />
              <InfoRow label="Motivo"    value={citaSeleccionada.motivo} />
              <InfoRow label="Síntomas"  value={citaSeleccionada.sintomas} />

              {/* Status */}
              <Text style={s.detalleLabelSec}>Status actual</Text>
              <StatusBadge status={citaSeleccionada.status} />

              {/* Cambiar status */}
              <Text style={s.detalleLabelSec}>Cambiar Status</Text>
              <View style={s.statusBotones}>
                {["agendada", "en curso", "concluida"].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      s.statusBtn,
                      { backgroundColor: STATUS_CONFIG[st].color },
                      citaSeleccionada.status === st && s.statusBtnActivo,
                    ]}
                    onPress={() => {
                      cambiarStatus(citaSeleccionada, st);
                      setCitaSeleccionada({ ...citaSeleccionada, status: st });
                    }}
                  >
                    <Text style={s.statusBtnTxt}>{STATUS_CONFIG[st].label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Evaluaciones */}
              <Text style={s.detalleLabelSec}>Evaluaciones Geriátricas</Text>
              <View style={s.evaluacionesRow}>
                {Object.entries(citaSeleccionada.evaluaciones || {}).map(([key, val]) =>
                  val ? (
                    <View key={key} style={s.evalChip}>
                      <Text style={s.evalChipTxt}>{key}</Text>
                    </View>
                  ) : null
                )}
              </View>

              {/* Acceso a signos vitales y pruebas médicas */}
              <Text style={s.detalleLabelSec}>Durante la cita</Text>
              <TouchableOpacity
                style={[s.btnModal, { backgroundColor: "#E53935" }]}
                onPress={() => {
                  setModalVisible(false);
                  setScreen("SignosVitales");
                }}
              >
                <Text style={s.btnModalTxt}> Control de Signos Vitales</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btnModal, { backgroundColor: "#6A1B9A" }]}
                onPress={() => {
                  setModalVisible(false);
                  setScreen("Evaluaciones");
                }}
              >
                <Text style={s.btnModalTxt}> Pruebas Médicas / Evaluaciones</Text>
              </TouchableOpacity>

              {/* Observaciones */}
              <Text style={s.detalleLabelSec}>Observaciones de la cita</Text>
              <TextInput
                style={[s.input, { height: 120, textAlignVertical: "top" }]}
                multiline
                placeholder="Escriba las observaciones de la cita..."
                value={observaciones}
                onChangeText={setObservaciones}
              />
              <TouchableOpacity style={s.btnGuardar} onPress={guardarObservaciones}>
                <Text style={s.btnGuardarTxt}> Guardar Observaciones</Text>
              </TouchableOpacity>

              {/* Re-agendar / Cancelar */}
              <View style={s.accionesRow}>
                <TouchableOpacity
                  style={[s.btnAccion, { backgroundColor: "#1565C0" }]}
                  onPress={() => {
                    setModalVisible(false);
                    setNuevaFecha(new Date(citaSeleccionada.fecha));
                    setModalReagendar(true);
                  }}
                >
                  <Text style={s.btnAccionTxt}> Re-agendar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.btnAccion, { backgroundColor: "#B71C1C" }]}
                  onPress={() => {
                    setModalVisible(false);
                    cancelarCita(citaSeleccionada);
                  }}
                >
                  <Text style={s.btnAccionTxt}> Cancelar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </Modal>


      <Modal
        visible={modalReagendar}
        animationType="slide"
        transparent
        onRequestClose={() => setModalReagendar(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalReagendar}>
            <Text style={s.modalTitulo}> Re-agendar Cita</Text>
            <Text style={s.modalSubtitulo}>
              {citaSeleccionada?.nombre}
            </Text>

            <TouchableOpacity style={s.dateBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={s.dateBtnTxt}>
                  {nuevaFecha.toLocaleDateString("es-MX")}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={nuevaFecha}
                mode="date"
                display="default"
                onChange={(e, d) => { setShowDatePicker(Platform.OS === "ios"); if (d) setNuevaFecha(d); }}
              />
            )}

            <TouchableOpacity style={s.dateBtn} onPress={() => setShowTimePicker(true)}>
              <Text style={s.dateBtnTxt}>
                  {nuevaHora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={nuevaHora}
                mode="time"
                display="default"
                onChange={(e, t) => { setShowTimePicker(Platform.OS === "ios"); if (t) setNuevaHora(t); }}
              />
            )}

            <View style={s.accionesRow}>
              <TouchableOpacity
                style={[s.btnAccion, { backgroundColor: "#1565C0" }]}
                onPress={reagendarCita}
              >
                <Text style={s.btnAccionTxt}> Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btnAccion, { backgroundColor: "#666" }]}
                onPress={() => setModalReagendar(false)}
              >
                <Text style={s.btnAccionTxt}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}



function CitaCard({ cita, onVerDetalle, onCambiarStatus, onReagendar, onCancelar, setScreen }) {
  const cfg = STATUS_CONFIG[cita.status] || STATUS_CONFIG.agendada;
  return (
    <View style={[s.citaCard, { borderLeftColor: cfg.color }]}>
      <View style={s.citaTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.citaNombre}> {cita.nombre}</Text>
          <Text style={s.citaSub}> {cita.medico || "Sin médico"}</Text>
          <Text style={s.citaSub}> {cita.centroGeriatrico || "Sin centro"}</Text>
          <Text style={s.citaSub}>
             {new Date(cita.fecha).toLocaleDateString("es-MX")}   {cita.hora}
          </Text>
        </View>
        <StatusBadge status={cita.status} />
      </View>

      {cita.motivo ? <Text style={s.citaMotivo}> {cita.motivo}</Text> : null}

      {/* Acciones rápidas de status */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.statusRow}>
        {["agendada", "en curso", "concluida"].map((st) => (
          <TouchableOpacity
            key={st}
            style={[
              s.statusMiniBtn,
              { backgroundColor: STATUS_CONFIG[st].bg, borderColor: STATUS_CONFIG[st].color },
              cita.status === st && { backgroundColor: STATUS_CONFIG[st].color },
            ]}
            onPress={() => onCambiarStatus(st)}
          >
            <Text
              style={[
                s.statusMiniTxt,
                { color: STATUS_CONFIG[st].color },
                cita.status === st && { color: "#fff" },
              ]}
            >
              {STATUS_CONFIG[st].label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Botones de acción */}
      <View style={s.citaBotones}>
        <TouchableOpacity style={[s.citaBtn, { backgroundColor: "#1565C0" }]} onPress={onVerDetalle}>
          <Text style={s.citaBtnTxt}>Detalle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.citaBtn, { backgroundColor: "#4CAF50" }]} onPress={onReagendar}>
          <Text style={s.citaBtnTxt}>Re-agendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.citaBtn, { backgroundColor: "#B71C1C" }]} onPress={onCancelar}>
          <Text style={s.citaBtnTxt}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.agendada;
  return (
    <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
      <Text style={[s.statusBadgeTxt, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function ResumenChip({ icon, valor, label, color }) {
  return (
    <View style={[s.resumenChip, { borderColor: color }]}>
      <Text style={s.resumenIcon}>{icon}</Text>
      <Text style={[s.resumenValor, { color }]}>{valor}</Text>
      <Text style={s.resumenLabel}>{label}</Text>
    </View>
  );
}

function GraficaBarra({ titulo, labels, datos, color }) {
  if (!datos.length || datos.every((d) => d === 0)) return null;
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };
  return (
    <View style={s.grafCard}>
      <Text style={s.grafTitulo}>{titulo}</Text>
      <BarChart
        data={{ labels, datasets: [{ data: datos }] }}
        width={SCREEN_W - 16}
        height={200}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo:   "#fff",
          color: (op = 1) => `rgba(${hexToRgb(color)}, ${op})`,
          labelColor: () => "#555",
          barPercentage: 0.6,
          decimalPlaces: 0,
        }}
        style={{ borderRadius: 12 }}
        showValuesOnTopOfBars
      />
    </View>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

function EmptyState({ mensaje }) {
  return (
    <View style={s.emptyBox}>
      <Text style={s.emptyTxt}>{mensaje}</Text>
    </View>
  );
}

function iconMovimiento(mov) {
  const iconos = {
    cita:        "",
    cancela:     "",
    "re-agenda": "",
    "en curso":  "",
    concluida:   "",
    observación: "",
    signo:       "",
  };
  return iconos[mov] || "";
}



const s = StyleSheet.create({
  root:              { flex: 1, backgroundColor: "#EEF2F7" },

  // Resumen bar
  resumenBar:        { flexDirection: "row", justifyContent: "space-around",
                       backgroundColor: "#fff", padding: 12, elevation: 3 },
  resumenChip:       { alignItems: "center", borderWidth: 1.5, borderRadius: 10,
                       paddingHorizontal: 10, paddingVertical: 6 },
  resumenIcon:       { fontSize: 16 },
  resumenValor:      { fontSize: 20, fontWeight: "900" },
  resumenLabel:      { fontSize: 9, color: "#666", marginTop: 1 },

  // Tabs
  tabsBar:           { backgroundColor: "#fff", flexGrow: 0, paddingHorizontal: 8,
                       paddingVertical: 8, elevation: 2 },
  tabBtn:            { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
                       marginRight: 6, backgroundColor: "#EEF2F7" },
  tabBtnActive:      { backgroundColor: "#1565C0" },
  tabTxt:            { fontWeight: "700", color: "#555", fontSize: 13 },
  tabTxtActive:      { color: "#fff" },

  body:              { flex: 1, padding: 12 },

  // Buscador
  buscador:          { backgroundColor: "#fff", borderRadius: 12, padding: 12,
                       marginBottom: 10, elevation: 2, fontSize: 14 },

  // Filtros
  filtrosRow:        { flexGrow: 0, marginBottom: 12 },
  filtroChip:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16,
                       backgroundColor: "#fff", marginRight: 8, elevation: 1 },
  filtroChipActive:  { backgroundColor: "#1565C0" },
  filtroTxt:         { fontWeight: "600", color: "#555", fontSize: 12 },
  filtroTxtActive:   { color: "#fff" },

  // Cita card
  citaCard:          { backgroundColor: "#fff", borderRadius: 14, padding: 14,
                       marginBottom: 12, elevation: 3, borderLeftWidth: 5 },
  citaTop:           { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  citaNombre:        { fontSize: 15, fontWeight: "800", color: "#0D47A1" },
  citaSub:           { fontSize: 12, color: "#555", marginTop: 2 },
  citaMotivo:        { fontSize: 12, color: "#777", fontStyle: "italic", marginBottom: 8 },
  statusRow:         { flexGrow: 0, marginVertical: 8 },
  statusMiniBtn:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14,
                       marginRight: 6, borderWidth: 1.5 },
  statusMiniTxt:     { fontSize: 11, fontWeight: "700" },
  citaBotones:       { flexDirection: "row", gap: 6, marginTop: 4 },
  citaBtn:           { flex: 1, padding: 8, borderRadius: 10, alignItems: "center" },
  citaBtnTxt:        { color: "#fff", fontWeight: "700", fontSize: 11 },

  // Status badge
  statusBadge:       { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
                       alignSelf: "flex-start" },
  statusBadgeTxt:    { fontWeight: "700", fontSize: 11 },

  // Paciente card
  pacienteCard:      { backgroundColor: "#fff", borderRadius: 14, padding: 14,
                       marginBottom: 12, elevation: 3 },
  pacienteNombre:    { fontSize: 16, fontWeight: "800", color: "#0D47A1", marginBottom: 4 },
  pacienteSub:       { fontSize: 12, color: "#555", marginBottom: 8 },
  pacienteStatusRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  pacienteStatusChip:{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  historialItem:     { borderTopWidth: 1, borderTopColor: "#EEF2F7",
                       paddingTop: 6, marginTop: 6 },
  historialFecha:    { fontSize: 12, color: "#333" },
  historialMedico:   { fontSize: 11, color: "#666" },
  masHistorial:      { fontSize: 11, color: "#1565C0", marginTop: 4, fontStyle: "italic" },

  // Gráficas
  grafCard:          { backgroundColor: "#fff", borderRadius: 14, padding: 14,
                       marginBottom: 14, elevation: 3 },
  grafTitulo:        { fontSize: 14, fontWeight: "700", color: "#1565C0", marginBottom: 10 },

  // Bitácora
  bitacoraHeader:    { flexDirection: "row", justifyContent: "space-between",
                       alignItems: "center", marginBottom: 8 },
  btnRefresh:        { backgroundColor: "#1565C0", paddingHorizontal: 12,
                       paddingVertical: 6, borderRadius: 8 },
  btnRefreshTxt:     { color: "#fff", fontWeight: "700", fontSize: 12 },
  bitacoraItem:      { backgroundColor: "#fff", borderRadius: 10, padding: 12,
                       marginBottom: 8, elevation: 2, borderLeftWidth: 4, borderLeftColor: "#1565C0" },
  bitacoraTop:       { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  bitacoraMovimiento:{ fontWeight: "700", fontSize: 13, color: "#1565C0", textTransform: "capitalize" },
  bitacoraFecha:     { fontSize: 11, color: "#888" },
  bitacoraUsuario:   { fontSize: 12, color: "#555" },
  bitacoraDetalle:   { fontSize: 11, color: "#777", marginTop: 3, fontStyle: "italic" },

  // Modal detalle
  modalContainer:    { flex: 1, backgroundColor: "#EEF2F7", padding: 16 },
  modalHeader:       { flexDirection: "row", justifyContent: "space-between",
                       alignItems: "center", marginBottom: 16 },
  modalTitulo:       { fontSize: 18, fontWeight: "800", color: "#0D47A1" },
  modalSubtitulo:    { fontSize: 14, color: "#555", marginBottom: 16 },
  modalCerrar:       { fontSize: 22, color: "#B71C1C", fontWeight: "700" },

  infoRow:           { backgroundColor: "#fff", borderRadius: 10, padding: 12,
                       marginBottom: 6, flexDirection: "row", gap: 10, elevation: 1 },
  infoLabel:         { fontWeight: "700", color: "#1565C0", width: 80, fontSize: 13 },
  infoValue:         { flex: 1, color: "#333", fontSize: 13 },

  detalleLabelSec:   { fontSize: 13, fontWeight: "700", color: "#0D47A1",
                       marginTop: 16, marginBottom: 6 },

  statusBotones:     { flexDirection: "row", gap: 8, marginBottom: 8 },
  statusBtn:         { flex: 1, padding: 10, borderRadius: 10, alignItems: "center" },
  statusBtnActivo:   { elevation: 4, transform: [{ scale: 1.03 }] },
  statusBtnTxt:      { color: "#fff", fontWeight: "700", fontSize: 11 },

  evaluacionesRow:   { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  evalChip:          { backgroundColor: "#E3F2FD", paddingHorizontal: 12,
                       paddingVertical: 6, borderRadius: 10 },
  evalChipTxt:       { color: "#1565C0", fontWeight: "700", fontSize: 12 },

  btnModal:          { padding: 14, borderRadius: 12, alignItems: "center",
                       marginBottom: 8, elevation: 3 },
  btnModalTxt:       { color: "#fff", fontWeight: "700", fontSize: 14 },

  input:             { borderWidth: 1, borderColor: "#1565C0", borderRadius: 10,
                       padding: 12, backgroundColor: "#fff", marginBottom: 8 },
  btnGuardar:        { backgroundColor: "#2E7D32", padding: 14, borderRadius: 12,
                       alignItems: "center", marginBottom: 16 },
  btnGuardarTxt:     { color: "#fff", fontWeight: "700", fontSize: 14 },

  accionesRow:       { flexDirection: "row", gap: 10, marginTop: 8 },
  btnAccion:         { flex: 1, padding: 13, borderRadius: 12, alignItems: "center" },
  btnAccionTxt:      { color: "#fff", fontWeight: "700", fontSize: 13 },

  // Modal re-agendar
  modalOverlay:      { flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
                       justifyContent: "center", padding: 24 },
  modalReagendar:    { backgroundColor: "#fff", borderRadius: 16, padding: 20, elevation: 10 },
  dateBtn:           { borderWidth: 1, borderColor: "#1565C0", padding: 14,
                       borderRadius: 10, backgroundColor: "#E3F2FD", marginBottom: 12 },
  dateBtnTxt:        { fontSize: 16, color: "#0D47A1" },

  // Sección
  seccionTitulo:     { fontSize: 16, fontWeight: "800", color: "#0D47A1", marginBottom: 12 },

  emptyBox:          { alignItems: "center", padding: 40 },
  emptyTxt:          { color: "#aaa", fontSize: 14, textAlign: "center", fontStyle: "italic" },
});