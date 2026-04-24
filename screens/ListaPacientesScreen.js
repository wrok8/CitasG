// screens/ListaPacientesScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";

import {
  ref,
  onValue,
  remove,
  update,
} from "firebase/database";
import { db } from "../firebaseConfig";

export default function ListaPacientesScreen({
  setScreen,
  setPacienteActual,
  pacientes,
  setPacientes,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] =
    useState(null);

  useEffect(() => {
    const citasRef = ref(db, "citas");

    const unsubscribe = onValue(citasRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const lista = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        lista.sort(
          (a, b) =>
            new Date(b.fecha) - new Date(a.fecha)
        );

        setPacientes(lista);
      } else {
        setPacientes([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const abrirModal = (paciente) => {
    setPacienteSeleccionado(paciente);
    setModalVisible(true);
  };

  const eliminarPaciente = async () => {
    if (!pacienteSeleccionado?.id) return;

    await remove(
      ref(db, `citas/${pacienteSeleccionado.id}`)
    );

    setModalVisible(false);
  };

  const cancelarCita = async () => {
    if (!pacienteSeleccionado?.id) return;

    await update(
      ref(db, `citas/${pacienteSeleccionado.id}`),
      {
        status: "Cancelada",
      }
    );

    setModalVisible(false);
  };

  const renderItem = ({ item }) => {
    const ultimaMedicion =
      item.signosVitales?.[0] || null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => abrirModal(item)}
      >
        <Text style={styles.nombre}>
          {item.nombre}
        </Text>

        <Text>
          📅 Fecha:{" "}
          {item.fecha
            ? new Date(
                item.fecha
              ).toLocaleDateString()
            : "Sin fecha"}
        </Text>

        <Text>
          🩺 Médico:{" "}
          {item.medicoNombre ||
            "No asignado"}
        </Text>

        <Text>
          📌 Estado:{" "}
          {item.status || "Agenda"}
        </Text>

        <Text numberOfLines={2}>
          🤒 Síntomas:{" "}
          {item.sintomas ||
            "No especificados"}
        </Text>

        <Text style={styles.pruebas}>
          📋 Pruebas:{" "}
          {item.pruebas?.length || 0}
        </Text>

        <Text style={styles.pruebas}>
          ❤️ Signos Vitales:{" "}
          {item.signosVitales?.length || 0}
        </Text>

        {ultimaMedicion && (
          <View style={styles.signosBox}>
            <Text>
              ❤️ {ultimaMedicion.bpm} BPM
            </Text>
            <Text>
              🌡️ {ultimaMedicion.temp}°C
            </Text>
            <Text>
              💧 {ultimaMedicion.spo2}%
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {pacientes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No hay pacientes registrados
          </Text>
        </View>
      ) : (
        <FlatList
          data={pacientes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              ¿Qué deseas hacer?
            </Text>

            <Pressable
              style={styles.btn}
              onPress={() => {
                setPacienteActual(
                  pacienteSeleccionado
                );
                setModalVisible(false);
                setScreen("Resumen");
              }}
            >
              <Text style={styles.btnText}>
                👁 Ver Resumen
              </Text>
            </Pressable>

            <Pressable
              style={styles.btn}
              onPress={() => {
                setPacienteActual(
                  pacienteSeleccionado
                );
                setModalVisible(false);
                setScreen(
                  "Signos Vitales"
                );
              }}
            >
              <Text style={styles.btnText}>
                ❤️ Ver Signos Vitales
              </Text>
            </Pressable>

            <Pressable
              style={styles.btn}
              onPress={() => {
                setPacienteActual(
                  pacienteSeleccionado
                );
                setModalVisible(false);
                setScreen(
                  "Agendar Cita"
                );
              }}
            >
              <Text style={styles.btnText}>
                ✏ Editar
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.btn,
                styles.cancelar,
              ]}
              onPress={cancelarCita}
            >
              <Text style={styles.btnText}>
                ❌ Cancelar
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.btn,
                styles.eliminar,
              ]}
              onPress={eliminarPaciente}
            >
              <Text style={styles.btnText}>
                🗑 Eliminar
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.btn,
                styles.cerrar,
              ]}
              onPress={() =>
                setModalVisible(false)
              }
            >
              <Text style={styles.btnText}>
                Cerrar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  pruebas: {
    marginTop: 5,
    fontWeight: "bold",
  },
  signosBox: {
    marginTop: 10,
    backgroundColor: "#E3F2FD",
    padding: 10,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
  },
  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  btn: {
    backgroundColor: "#1565C0",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  btnText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  cancelar: {
    backgroundColor: "#F57C00",
  },
  eliminar: {
    backgroundColor: "#D32F2F",
  },
  cerrar: {
    backgroundColor: "#757575",
  },
});