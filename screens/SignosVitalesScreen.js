import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";
import { Accelerometer } from "expo-sensors";

const SCREEN_W = Dimensions.get("window").width - 32;
const STORAGE_KEY = "@signos_vitales_historial";

const RANGOS = {
  bpm:  { min: 60,   max: 100,  label: "60–100 BPM"  },
  temp: { min: 36.0, max: 37.5, label: "36–37.5 °C"  },
  spo2: { min: 95,   max: 100,  label: "> 95 %"       },
};

const enRango = (val, key) => val >= RANGOS[key].min && val <= RANGOS[key].max;
const rand = (min, max, dec = 0) => {
  const v = Math.random() * (max - min) + min;
  return dec ? parseFloat(v.toFixed(dec)) : Math.round(v);
};

export default function SignosVitalesScreen({ setScreen }) {
  const [mediciones, setMediciones] = useState([]);
  const [accel, setAccel]           = useState({ x: 0, y: 0, z: 0 });
  const [tab, setTab]               = useState("monitor");

  useEffect(() => {
    Accelerometer.setUpdateInterval(400);
    const sub = Accelerometer.addListener((data) => setAccel(data));
    cargarHistorial();
    return () => sub.remove();
  }, []);

  const cargarHistorial = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setMediciones(JSON.parse(raw));
    } catch (_) {}
  };

  const guardarHistorial = async (lista) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch (_) {}
  };

  const tomarMedicion = () => {
    const magnitud = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
    const actividad = Math.min(magnitud / 2, 1);

    const bpm  = rand(55 + actividad * 15, 105 + actividad * 10);
    const temp = rand(35.4 + actividad * 0.3, 38.2 + actividad * 0.3, 1);
    const spo2 = rand(91, 100);

    const ahora = new Date();
    const nueva = {
      id:   ahora.getTime().toString(),
      fecha: ahora.toLocaleDateString("es-MX"),
      hora:  ahora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      bpm,
      temp,
      spo2,
    };

    const actualizadas = [nueva, ...mediciones].slice(0, 30);
    setMediciones(actualizadas);
    guardarHistorial(actualizadas);

    const alertas = [];
    if (!enRango(bpm,  "bpm"))  alertas.push(`❤️  FC: ${bpm} BPM  (normal: ${RANGOS.bpm.label})`);
    if (!enRango(temp, "temp")) alertas.push(`🌡️  Temp: ${temp}°C  (normal: ${RANGOS.temp.label})`);
    if (!enRango(spo2, "spo2")) alertas.push(`💧 SpO₂: ${spo2}%  (normal: ${RANGOS.spo2.label})`);

    if (alertas.length > 0) {
      Alert.alert(
        "⚠️ Valores Fuera de Rango",
        alertas.join("\n\n"),
        [{ text: "Entendido", style: "default" }]
      );
    }
  };

  const ultima = mediciones[0] ?? null;

  const ultimas7  = mediciones.slice(0, 7).reverse();
  const hayDatos  = ultimas7.length > 0;
  const etiquetas = hayDatos ? ultimas7.map((m) => m.hora) : ["--"];
  const datosBpm  = hayDatos ? ultimas7.map((m) => m.bpm)  : [0];
  const datosTemp = hayDatos ? ultimas7.map((m) => m.temp) : [0];
  const datosSpo2 = hayDatos ? ultimas7.map((m) => m.spo2) : [0];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Signos Vitales</Text>
        <TouchableOpacity 
          style={s.btnVolver}
          onPress={() => setScreen ? setScreen("Agendar Cita") : null}
        >
          <Text style={s.btnVolverTxt}>← Volver</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>

        <View style={s.tabs}>
          <Tab label="📊 Monitor"   active={tab === "monitor"}   onPress={() => setTab("monitor")} />
          <Tab label="📋 Historial" active={tab === "historial"} onPress={() => setTab("historial")} />
        </View>

        {tab === "monitor" && (
          <>
            <View style={s.card}>
              <Text style={s.cardTitle}>Lectura Actual</Text>
              <View style={s.row3}>
                <Badge
                  icon="❤️"  label="Frec. Cardíaca"
                  value={ultima?.bpm  ?? "--"} unit="BPM"
                  color="#E53935"
                  ok={ultima ? enRango(ultima.bpm,  "bpm")  : true}
                />
                <Badge
                  icon="🌡️" label="Temperatura"
                  value={ultima?.temp ?? "--"} unit="°C"
                  color="#FB8C00"
                  ok={ultima ? enRango(ultima.temp, "temp") : true}
                />
                <Badge
                  icon="💧"  label="SpO₂"
                  value={ultima?.spo2 ?? "--"} unit="%"
                  color="#1E88E5"
                  ok={ultima ? enRango(ultima.spo2, "spo2") : true}
                />
              </View>
              {ultima && (
                <Text style={s.fechaUlt}>
                  Última lectura: {ultima.fecha}  {ultima.hora}
                </Text>
              )}
            </View>

            <View style={s.sensorCard}>
              <Text style={s.sensorTitle}>🔄 Sensor de Movimiento (Acelerómetro)</Text>
              <View style={s.accelRow}>
                <AccelVal axis="X" val={accel.x} />
                <AccelVal axis="Y" val={accel.y} />
                <AccelVal axis="Z" val={accel.z} />
              </View>
              <Text style={s.sensorNote}>
                El movimiento del dispositivo influye en la simulación de medición.
              </Text>
            </View>

            <TouchableOpacity style={s.btnMedir} onPress={tomarMedicion} activeOpacity={0.8}>
              <Text style={s.btnMedirTxt}>📊 Tomar Nueva Medición</Text>
            </TouchableOpacity>

            {hayDatos ? (
              <View style={s.card}>
                <Text style={s.cardTitle}>Gráficas de Seguimiento</Text>

                <Text style={s.chartLabel}>❤️ Frecuencia Cardíaca (BPM)</Text>
                <Text style={s.chartTipo}>Tipo: Línea – seguimiento puntual en el tiempo</Text>
                <LineChart
                  data={{ labels: etiquetas, datasets: [{ data: datosBpm }] }}
                  width={SCREEN_W}
                  height={190}
                  chartConfig={makeConfig("#E53935", "#E53935")}
                  bezier
                  style={s.chart}
                  withDots
                />

                <Text style={s.chartLabel}>🌡️ Temperatura Corporal (°C)</Text>
                <Text style={s.chartTipo}>Tipo: Área – tendencia con relleno bajo la curva</Text>
                <LineChart
                  data={{ labels: etiquetas, datasets: [{ data: datosTemp }] }}
                  width={SCREEN_W}
                  height={190}
                  chartConfig={makeConfig("#FB8C00", "#FB8C00", 0.35)}
                  bezier
                  withShadow
                  style={s.chart}
                />

                <Text style={s.chartLabel}>💧 Saturación de Oxígeno (%)</Text>
                <Text style={s.chartTipo}>Tipo: Área – tendencia con relleno bajo la curva</Text>
                <LineChart
                  data={{ labels: etiquetas, datasets: [{ data: datosSpo2 }] }}
                  width={SCREEN_W}
                  height={190}
                  chartConfig={makeConfig("#1E88E5", "#1E88E5", 0.3)}
                  bezier
                  withShadow
                  style={s.chart}
                />
              </View>
            ) : (
              <View style={s.emptyBox}>
                <Text style={s.emptyTxt}>
                  Toma tu primera medición para ver las gráficas 📈
                </Text>
              </View>
            )}
          </>
        )}

        {tab === "historial" && (
          <View style={s.card}>
            <Text style={s.cardTitle}>📋 Historial de Mediciones</Text>
            {mediciones.length === 0 ? (
              <Text style={s.emptyTxt}>No hay mediciones registradas aún.</Text>
            ) : (
              mediciones.map((m) => <ItemHistorial key={m.id} m={m} />)
            )}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

function Tab({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[s.tab, active && s.tabActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[s.tabTxt, active && s.tabTxtActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Badge({ icon, label, value, unit, color, ok }) {
  return (
    <View style={[s.badge, !ok && s.badgeAlerta]}>
      <Text style={s.badgeIcon}>{icon}</Text>
      <Text style={[s.badgeVal, { color }]}>{value}</Text>
      <Text style={[s.badgeUnit, { color }]}>{unit}</Text>
      <Text style={s.badgeLbl}>{label}</Text>
      {!ok && <Text style={s.alertaDot}>⚠️</Text>}
    </View>
  );
}

function AccelVal({ axis, val }) {
  return (
    <View style={s.accelItem}>
      <Text style={s.accelAxis}>{axis}</Text>
      <Text style={s.accelNum}>{val.toFixed(2)}</Text>
    </View>
  );
}

function ItemHistorial({ m }) {
  const bpmOk  = enRango(m.bpm,  "bpm");
  const tempOk = enRango(m.temp, "temp");
  const spo2Ok = enRango(m.spo2, "spo2");
  const todoOk = bpmOk && tempOk && spo2Ok;

  return (
    <View style={[s.histItem, !todoOk && s.histItemAlerta]}>
      <Text style={s.histFecha}>
        🕐 {m.fecha}  {m.hora}
        {!todoOk && "  ⚠️"}
      </Text>
      <View style={s.histRow}>
        <Text style={[s.histVal, !bpmOk  && s.histValAlerta]}>❤️ {m.bpm} BPM</Text>
        <Text style={[s.histVal, !tempOk && s.histValAlerta]}>🌡️ {m.temp}°C</Text>
        <Text style={[s.histVal, !spo2Ok && s.histValAlerta]}>💧 {m.spo2}%</Text>
      </View>
    </View>
  );
}

function makeConfig(strokeColor, fillColor, fillOpacity = 0) {
  return {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo:   "#ffffff",
    color: (op = 1) => strokeColor + Math.round(op * 255).toString(16).padStart(2, "0"),
    labelColor: () => "#666",
    strokeWidth: 2.5,
    decimalPlaces: 1,
    fillShadowGradient: fillColor,
    fillShadowGradientOpacity: fillOpacity,
    propsForDots: { r: "4", strokeWidth: "1", stroke: strokeColor },
  };
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#EEF2F7" },

  header:       { flexDirection: "row", justifyContent: "space-between",
                  alignItems: "center", backgroundColor: "#fff", padding: 16,
                  elevation: 3 },
  headerTitle:  { fontSize: 18, fontWeight: "800", color: "#0D47A1" },
  btnVolver:    { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#1565C0",
                  borderRadius: 8 },
  btnVolverTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },

  scrollView:   { flex: 1, padding: 16 },

  tabs:         { flexDirection: "row", marginBottom: 14, gap: 8 },
  tab:          { flex: 1, padding: 11, borderRadius: 10, backgroundColor: "#fff",
                  alignItems: "center", elevation: 1 },
  tabActive:    { backgroundColor: "#1565C0" },
  tabTxt:       { fontWeight: "700", color: "#555", fontSize: 13 },
  tabTxtActive: { color: "#fff" },

  card:         { backgroundColor: "#fff", borderRadius: 14, padding: 16,
                  marginBottom: 14, elevation: 3 },
  cardTitle:    { fontSize: 15, fontWeight: "700", color: "#1565C0", marginBottom: 12 },

  row3:         { flexDirection: "row", justifyContent: "space-around" },
  badge:        { alignItems: "center", flex: 1, marginHorizontal: 4, padding: 10,
                  borderRadius: 12, backgroundColor: "#F5F7FA" },
  badgeAlerta:  { backgroundColor: "#FFF0F0", borderWidth: 1.5, borderColor: "#FFCDD2" },
  badgeIcon:    { fontSize: 24 },
  badgeVal:     { fontSize: 22, fontWeight: "800", marginTop: 2 },
  badgeUnit:    { fontSize: 11, fontWeight: "600" },
  badgeLbl:     { fontSize: 10, color: "#777", textAlign: "center", marginTop: 3 },
  alertaDot:    { fontSize: 13, marginTop: 2 },
  fechaUlt:     { textAlign: "center", color: "#999", fontSize: 11, marginTop: 10 },

  sensorCard:   { backgroundColor: "#E8F5E9", borderRadius: 12, padding: 12,
                  marginBottom: 14 },
  sensorTitle:  { fontWeight: "700", color: "#2E7D32", fontSize: 13, marginBottom: 8 },
  accelRow:     { flexDirection: "row", justifyContent: "space-around" },
  accelItem:    { alignItems: "center" },
  accelAxis:    { fontWeight: "700", color: "#388E3C" },
  accelNum:     { fontFamily: "monospace", color: "#1B5E20", fontSize: 13 },
  sensorNote:   { color: "#555", fontSize: 11, marginTop: 8, fontStyle: "italic" },

  btnMedir:     { backgroundColor: "#1565C0", padding: 16, borderRadius: 14,
                  alignItems: "center", marginBottom: 14, elevation: 4 },
  btnMedirTxt:  { color: "#fff", fontSize: 16, fontWeight: "700" },

  chartLabel:   { fontSize: 13, fontWeight: "700", color: "#333", marginTop: 12, marginBottom: 2 },
  chartTipo:    { fontSize: 11, color: "#888", fontStyle: "italic", marginBottom: 6 },
  chart:        { borderRadius: 10 },

  emptyBox:     { alignItems: "center", padding: 40 },
  emptyTxt:     { color: "#999", textAlign: "center", fontSize: 14 },

  histItem:     { backgroundColor: "#F9FAFB", borderRadius: 10, padding: 10,
                  marginBottom: 8, borderLeftWidth: 4, borderLeftColor: "#4CAF50" },
  histItemAlerta: { borderLeftColor: "#F44336", backgroundColor: "#FFF8F8" },
  histFecha:    { fontSize: 11, color: "#888", marginBottom: 4 },
  histRow:      { flexDirection: "row", justifyContent: "space-between" },
  histVal:      { fontSize: 13, fontWeight: "600", color: "#333" },
  histValAlerta:{ color: "#E53935" },
});