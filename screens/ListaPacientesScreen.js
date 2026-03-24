import React, { useState, useEffect} from "react";
import { ref, onValue, remove } from "firebase/database";
import { db } from "../firebaseConfig";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";

export default function ListaPacientesScreen({
  pacientes,
  setScreen,
  setPacienteActual,
  setPacientes,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  const getPacienteKey = (paciente) => {
    return `${paciente.nombre}-${paciente.telefono}-${paciente.fecha}`;
  };

  const abrirModal = (paciente) => {
    setPacienteSeleccionado(paciente);
    setModalVisible(true);
  };

  const eliminarPaciente = () => {
    remove(ref(db, `pacientes/${pacienteSeleccionado.id}`));
    setModalVisible(false);
  };

  useEffect(() => {
  const pacientesRef = ref(db, "pacientes");

  onValue(pacientesRef, (snapshot) => {
    const data = snapshot.val();

    if (data) {
      const lista = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      setPacientes(lista);
    } else {
      setPacientes([]);
    }
  });
}, []);

  return (
    <View style={{ flex: 1 }}>
      {pacientes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No hay pacientes guardados
          </Text>
        </View>
      ) : (
        <FlatList
          data={pacientes}
          keyExtractor={(item) => getPacienteKey(item)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => abrirModal(item)}
            >
              <Text style={styles.title}>{item.nombre}</Text>

              <Text>
                Fecha:{" "}
                {item.fecha
                  ? new Date(item.fecha).toLocaleDateString()
                  : "Sin fecha"}
              </Text>

              <Text numberOfLines={1}>
                Síntomas: {item.sintomas || "No especificados"}
              </Text>

              <Text style={styles.pruebasText}>
                Pruebas realizadas:{" "}
                {item.pruebas?.length || 0}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* MODAL */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              ¿Qué deseas hacer?
            </Text>

            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setPacienteActual(pacienteSeleccionado);
                setModalVisible(false);
                setScreen("Resumen");
              }}
            >
              <Text style={styles.modalButtonText}>
                👁 Ver Resumen
              </Text>
            </Pressable>

            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setPacienteActual(pacienteSeleccionado);
                setModalVisible(false);
                setScreen("Agendar Cita");
              }}
            >
              <Text style={styles.modalButtonText}>
                ✏ Editar
              </Text>
            </Pressable>

            <Pressable
              style={[styles.modalButton, { backgroundColor: "#D32F2F" }]}
              onPress={eliminarPaciente}
            >
              <Text style={styles.modalButtonText}>
                🗑 Eliminar
              </Text>
            </Pressable>

            <Pressable
              style={[styles.modalButton, { backgroundColor: "#9E9E9E" }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>
                Cancelar
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
    padding: 15,
    margin: 10,
    borderRadius: 12,
    elevation: 3,
  },

  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#0D47A1",
    marginBottom: 5,
  },

  pruebasText: {
    marginTop: 5,
    fontWeight: "bold",
    color: "#2E7D32",
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  modalButton: {
    backgroundColor: "#1565C0",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },

  modalButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});