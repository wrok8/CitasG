// screens/ListaPacientesScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { ref, onValue } from "firebase/database";
import { db } from "../firebaseConfig";

export default function ListaPacientesScreen({
  setScreen,
  setPacienteActual,
  pacientes,
  setPacientes,
}) {
  const [pacientesAgrupados, setPacientesAgrupados] = useState([]);

  useEffect(() => {
    const citasRef = ref(db, "citas");

    const unsubscribe = onValue(citasRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setPacientes([]);
        setPacientesAgrupados([]);
        return;
      }

      const lista = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));

      setPacientes(lista);

      // AGRUPAR POR NOMBRE
      const agrupados = {};

      lista.forEach((cita) => {
        const nombre = cita.nombre;

        if (!agrupados[nombre]) {
          agrupados[nombre] = [];
        }

        agrupados[nombre].push(cita);
      });

      const resultado = Object.keys(agrupados).map((nombre) => {
        const visitas = agrupados[nombre];

        visitas.sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );

        return {
          nombre,
          totalVisitas: visitas.length,
          ultimaVisita: visitas[0],
          historial: visitas,
        };
      });

      setPacientesAgrupados(resultado);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => {
    const esPrimeraVez = item.totalVisitas === 1;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setPacienteActual(item);
          setScreen("HistorialPaciente");
        }}
      >
        <Text style={styles.nombre}>
          {item.nombre}
        </Text>

        <Text>
          📅 Última cita:{" "}
          {new Date(
            item.ultimaVisita.fecha
          ).toLocaleDateString()}
        </Text>

        <Text>
          🩺 Médico:{" "}
          {item.ultimaVisita.medicoNombre}
        </Text>

        <Text>
          📌 Estado:{" "}
          {item.ultimaVisita.status}
        </Text>

        <Text>
          📋 Total visitas: {item.totalVisitas}
        </Text>

        <Text style={styles.tipoCita}>
          {esPrimeraVez
            ? "🆕 Primera vez"
            : "🔁 Consulta continua"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={pacientesAgrupados}
        keyExtractor={(item) => item.nombre}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#BBDEFB",
    margin: 10,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 8,
  },
  tipoCita: {
    marginTop: 8,
    fontWeight: "bold",
    color: "#1565C0",
  },
});