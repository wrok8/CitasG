import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";

import { BarChart } from "react-native-chart-kit";
import { ref, onValue } from "firebase/database";
import { db } from "../firebaseConfig";

const screenWidth = Dimensions.get("window").width;

export default function GraficasScreen() {
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    const citasRef = ref(db, "citas");

    const unsubscribe = onValue(citasRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const lista = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setCitas(lista);
      } else {
        setCitas([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const contarPorCampo = (campo) => {
    const conteo = {};

    citas.forEach((cita) => {
      const valor = cita[campo] || "Sin dato";
      conteo[valor] = (conteo[valor] || 0) + 1;
    });

    return {
      labels: Object.keys(conteo).slice(0, 5),
      datasets: [
        {
          data: Object.values(conteo).slice(0, 5),
        },
      ],
    };
  };

  const datosCentros = contarPorCampo("centroGeriatrico");
  const datosMedicos = contarPorCampo("medicoNombre");
  const datosPacientes = contarPorCampo("nombre");

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
         Dashboard de Citas
      </Text>

      <Text style={styles.subtitle}>
         Citas por Centro Geriátrico
      </Text>

      <BarChart
        data={datosCentros}
        width={screenWidth - 20}
        height={220}
        fromZero
        yAxisLabel=""
        chartConfig={chartConfig}
        style={styles.chart}
      />

      <Text style={styles.subtitle}>
         Citas por Médico
      </Text>

      <BarChart
        data={datosMedicos}
        width={screenWidth - 20}
        height={220}
        fromZero
        yAxisLabel=""
        chartConfig={chartConfig}
        style={styles.chart}
      />

      <Text style={styles.subtitle}>
         Citas por Paciente
      </Text>

      <BarChart
        data={datosPacientes}
        width={screenWidth - 20}
        height={220}
        fromZero
        yAxisLabel=""
        chartConfig={chartConfig}
        style={styles.chart}
      />
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) =>
    `rgba(21, 101, 192, ${opacity})`,
  labelColor: (opacity = 1) =>
    `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f4f6f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  chart: {
    borderRadius: 16,
  },
});