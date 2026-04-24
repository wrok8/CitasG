// screens/SignosVitalesScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,S
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";
import { Accelerometer } from "expo-sensors";
import { ref, update } from "firebase/database";
import { db } from "../firebaseConfig";

const SCREEN_W = Dimensions.get("window").width - 32;
const STORAGE_KEY = "@signos_vitales_historial";

const RANGOS = {
  bpm: { min: 60, max: 100, label: "60–100 BPM" },
  temp: { min: 36.0, max: 37.5, label: "36–37.5 °C" },
  spo2: { min: 95, max: 100, label: "> 95 %" },
};

const enRango = (val, key) =>
  val >= RANGOS[key].min && val <= RANGOS[key].max;

const rand = (min, max, dec = 0) => {
  const v = Math.random() * (max - min) + min;
  return dec ? parseFloat(v.toFixed(dec)) : Math.round(v);
};

export default function SignosVitalesScreen({
  pacienteActual,
  setPacienteActual,
  setScreen,
}) {
  const [mediciones, setMediciones] = useState(
    pacienteActual?.signosVitales || []
  );
  const [accel, setAccel] = useState({ x: 0, y: 0, z: 0 });
  const [tab, setTab] = useState("monitor");

  useEffect(() => {
    Accelerometer.setUpdateInterval(400);
    const sub = Accelerometer.addListener((data) => setAccel(data));

    if (!pacienteActual?.signosVitales?.length) {
      cargarHistorial();
    }

    return () => sub.remove();
  }, []);

  const cargarHistorial = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setMediciones(JSON.parse(raw));
    } catch (error) {
      console.log(error);
    }
  };

  const guardarHistorial = async (lista) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch (error) {
      console.log(error);
    }
  };

  const tomarMedicion = async () => {
    const magnitud = Math.sqrt(
      accel.x ** 2 + accel.y ** 2 + accel.z ** 2
    );

    const actividad = Math.min(magnitud / 2, 1);

    const bpm = rand(55 + actividad * 15, 105 + actividad * 10);
    const temp = rand(
      35.4 + actividad * 0.3,
      38.2 + actividad * 0.3,
      1
    );
    const spo2 = rand(91, 100);

    const ahora = new Date();

    const nueva = {
      id: ahora.getTime().toString(),
      fecha: ahora.toLocaleDateString("es-MX"),
      hora: ahora.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      bpm,
      temp,
      spo2,
    };

    const actualizadas = [nueva, ...mediciones].slice(0, 30);

    setMediciones(actualizadas);
    await guardarHistorial(actualizadas);

    if (pacienteActual?.id) {
      try {
        await update(ref(db, `citas/${pacienteActual.id}`), {
          signosVitales: actualizadas,
        });

        setPacienteActual({
          ...pacienteActual,
          signosVitales: actualizadas,
        });
      } catch (error) {
        console.log("Error guardando signos vitales:", error);
      }
    }

    const alertas = [];

    if (!enRango(bpm, "bpm")) {
      alertas.push(
        `❤️ FC: ${bpm} BPM (normal: ${RANGOS.bpm.label})`
      );
    }

    if (!enRango(temp, "temp")) {
      alertas.push(
        `🌡️ Temp: ${temp}°C (normal: ${RANGOS.temp.label})`
      );
    }

    if (!enRango(spo2, "spo2")) {
      alertas.push(
        `💧 SpO₂: ${spo2}% (normal: ${RANGOS.spo2.label})`
      );
    }

    if (alertas.length > 0) {
      Alert.alert(
        "⚠️ Valores Fuera de Rango",
        alertas.join("\n\n")
      );
    } else {
      Alert.alert("Éxito", "Medición guardada correctamente");
    }
  };

  const ultima = mediciones[0] ?? null;

  const ultimas7 = mediciones.slice(0, 7).reverse();
  const hayDatos = ultimas7.length > 0;
  const etiquetas = hayDatos
    ? ultimas7.map((m) => m.hora)
    : ["--"];

  const datosBpm = hayDatos
    ? ultimas7.map((m) => m.bpm)
    : [0];

  const datosTemp = hayDatos
    ? ultimas7.map((m) => m.temp)
    : [0];

  const datosSpo2 = hayDatos
    ? ultimas7.map((m) => m.spo2)
    : [0];

  return (
    <ScrollView style={s.container}>
      <View style={s.tabs}>
        <Tab
          label="📊 Monitor"
          active={tab === "monitor"}
          onPress={() => setTab("monitor")}
        />
        <Tab
          label="📋 Historial"
          active={tab === "historial"}
          onPress={() => setTab("historial")}
        />
      </View>

      {tab === "monitor" && (
        <>
          <View style={s.card}>
            <Text style={s.cardTitle}>Lectura Actual</Text>
            <View style={s.row3}>
              <Badge
                icon="❤️"
                label="Frec. Cardíaca"
                value={ultima?.bpm ?? "--"}
                unit="BPM"
                color="#E53935"
                ok={ultima ? enRango(ultima.bpm, "bpm") : true}
              />
              <Badge
                icon="🌡️"
                label="Temperatura"
                value={ultima?.temp ?? "--"}
                unit="°C"
                color="#FB8C00"
                ok={ultima ? enRango(ultima.temp, "temp") : true}
              />
              <Badge
                icon="💧"
                label="SpO₂"
                value={ultima?.spo2 ?? "--"}
                unit="%"
                color="#1E88E5"
                ok={ultima ? enRango(ultima.spo2, "spo2") : true}
              />
            </View>
          </View>

          <TouchableOpacity
            style={s.btnMedir}
            onPress={tomarMedicion}
          >
            <Text style={s.btnMedirTxt}>
              📊 Tomar Nueva Medición
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnResumen}
            onPress={() => setScreen("Resumen")}
          >
            <Text style={s.btnMedirTxt}>
              📋 Ir al Resumen
            </Text>
          </TouchableOpacity>

          {hayDatos && (
            <View style={s.card}>
              <Text style={s.cardTitle}>
                Gráficas de Seguimiento
              </Text>

              <LineChart
                data={{
                  labels: etiquetas,
                  datasets: [{ data: datosBpm }],
                }}
                width={SCREEN_W}
                height={180}
                chartConfig={makeConfig("#E53935")}
                bezier
                style={s.chart}
              />

              <LineChart
                data={{
                  labels: etiquetas,
                  datasets: [{ data: datosTemp }],
                }}
                width={SCREEN_W}
                height={180}
                chartConfig={makeConfig("#FB8C00")}
                bezier
                style={s.chart}
              />

              <LineChart
                data={{
                  labels: etiquetas,
                  datasets: [{ data: datosSpo2 }],
                }}
                width={SCREEN_W}
                height={180}
                chartConfig={makeConfig("#1E88E5")}
                bezier
                style={s.chart}
              />
            </View>
          )}
        </>
      )}

      {tab === "historial" && (
        <View style={s.card}>
          <Text style={s.cardTitle}>
            📋 Historial de Mediciones
          </Text>
          {mediciones.map((m) => (
            <ItemHistorial key={m.id} m={m} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function Tab({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[s.tab, active && s.tabActive]}
      onPress={onPress}
    >
      <Text style={[s.tabTxt, active && s.tabTxtActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Badge({ icon, label, value, unit, color }) {
  return (
    <View style={s.badge}>
      <Text>{icon}</Text>
      <Text style={{ color, fontWeight: "bold" }}>
        {value}
      </Text>
      <Text>{unit}</Text>
      <Text>{label}</Text>
    </View>
  );
}

function ItemHistorial({ m }) {
  return (
    <View style={s.histItem}>
      <Text>
        🕐 {m.fecha} {m.hora}
      </Text>
      <Text>❤️ {m.bpm} BPM</Text>
      <Text>🌡️ {m.temp}°C</Text>
      <Text>💧 {m.spo2}%</Text>
    </View>
  );
}

function makeConfig(color) {
  return {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: () => color,
    decimalPlaces: 1,
  };
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2F7",
    padding: 16,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 14,
    gap: 8,
  },
  tab: {
    flex: 1,
    padding: 11,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#1565C0",
  },
  tabTxt: {
    fontWeight: "700",
  },
  tabTxtActive: {
    color: "white",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  row3: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  badge: {
    alignItems: "center",
    flex: 1,
  },
  btnMedir: {
    backgroundColor: "#1565C0",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 14,
  },
  btnResumen: {
    backgroundColor: "#2E7D32",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 14,
  },
  btnMedirTxt: {
    color: "white",
    fontWeight: "700",
  },
  chart: {
    marginTop: 10,
    borderRadius: 10,
  },
  histItem: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
});