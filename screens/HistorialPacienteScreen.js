// screens/HistorialPacienteScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
} from "react-native";

import {
  ref,
  remove,
  update,
  onValue,
} from "firebase/database";
import { db } from "../firebaseConfig";
import { guardarMovimiento } from "../database";

export default function HistorialPacienteScreen({
  paciente,
  setPacienteActual,
  setScreen,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const citasRef = ref(db, "citas");

    const unsubscribe = onValue(citasRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setHistorial([]);
        return;
      }

      const lista = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));

      const historialPaciente = lista.filter(
        (cita) => cita.nombre === paciente.nombre
      );

      historialPaciente.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );

      setHistorial(historialPaciente);
    });

    return () => unsubscribe();
  }, [paciente.nombre]);

  const abrirModal = (cita) => {
    setCitaSeleccionada(cita);
    setModalVisible(true);
  };

    const eliminarCita = async () => {
    if (!citaSeleccionada?.id) return;

    try {
        await remove(
        ref(db, `citas/${citaSeleccionada.id}`)
        );

        await guardarMovimiento(
        citaSeleccionada.medicoNombre || "Sistema",
        `Cita eliminada - ${citaSeleccionada.nombre}`
        );

        setModalVisible(false);

        Alert.alert("Éxito", "Cita eliminada");
    } catch (error) {
        console.log(error);
        Alert.alert("Error", "No se pudo eliminar");
    }
    };

    const cancelarCita = async () => {
    if (!citaSeleccionada?.id) return;

    try {
        await update(
        ref(db, `citas/${citaSeleccionada.id}`),
        {
            status: "Cancelada",
        }
        );

        await guardarMovimiento(
        citaSeleccionada.medicoNombre || "Sistema",
        `Cita cancelada - ${citaSeleccionada.nombre}`
        );

        setModalVisible(false);

        Alert.alert("Éxito", "Cita cancelada");
    } catch (error) {
        console.log(error);
        Alert.alert("Error", "No se pudo cancelar");
    }
    };

    const reagendarCita = async () => {
    if (!citaSeleccionada?.id) return;

    try {
        await update(
        ref(db, `citas/${citaSeleccionada.id}`),
        {
            status: "Agenda",
            fecha: new Date().toISOString(),
        }
        );

        await guardarMovimiento(
        citaSeleccionada.medicoNombre || "Sistema",
        `Cita reagendada - ${citaSeleccionada.nombre}`
        );

        setModalVisible(false);

        Alert.alert("Éxito", "Cita reagendada");
    } catch (error) {
        console.log(error);
        Alert.alert("Error", "No se pudo reagendar");
    }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Historial de {paciente.nombre}
      </Text>

      {historial.length === 0 ? (
        <Text style={styles.empty}>
          No hay citas registradas
        </Text>
      ) : (
        <FlatList
          data={historial}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => abrirModal(item)}
            >
              <Text>
                📅{" "}
                {new Date(
                  item.fecha
                ).toLocaleDateString()}
              </Text>

              <Text>
                🩺 {item.medicoNombre}
              </Text>

              <Text>
                📌 {item.status}
              </Text>

            <Text>
            {historial.length === 1
                ? "🆕 Primera vez"
                : index === historial.length - 1
                ? "🆕 Primera vez"
                : "🔁 Consulta continua"}
            </Text>
            </TouchableOpacity>
          )}
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
                  citaSeleccionada
                );
                setModalVisible(false);
                setScreen("Resumen");
              }}
            >
              <Text style={styles.btnText}>
                 Ver Resumen
              </Text>
            </Pressable>

            <Pressable
              style={styles.btn}
              onPress={() => {
                setPacienteActual(
                  citaSeleccionada
                );
                setModalVisible(false);
                setScreen(
                  "Signos Vitales"
                );
              }}
            >
              <Text style={styles.btnText}>
                 Ver Signos Vitales
              </Text>
            </Pressable>

            <Pressable
              style={styles.btn}
              onPress={() => {
                setPacienteActual(
                  citaSeleccionada
                );
                setModalVisible(false);
                setScreen(
                  "Agendar Cita"
                );
              }}
            >
              <Text style={styles.btnText}>
                 Editar
              </Text>
            </Pressable>

            <Pressable
              style={styles.btn}
              onPress={() => {
                setPacienteActual(
                  citaSeleccionada
                );
                setModalVisible(false);
                setScreen(
                  "Observaciones"
                );
              }}
            >
              <Text style={styles.btnText}>
                 Observaciones
              </Text>
            </Pressable>

            {citaSeleccionada?.status ===
            "Cancelada" ? (
              <Pressable
                style={[
                  styles.btn,
                  styles.reagendar,
                ]}
                onPress={reagendarCita}
              >
                <Text style={styles.btnText}>
                   Reagendar
                </Text>
              </Pressable>
            ) : (
              <Pressable
                style={[
                  styles.btn,
                  styles.cancelar,
                ]}
                onPress={cancelarCita}
              >
                <Text style={styles.btnText}>
                   Cancelar
                </Text>
              </Pressable>
            )}

            <Pressable
              style={[
                styles.btn,
                styles.eliminar,
              ]}
              onPress={eliminarCita}
            >
              <Text style={styles.btnText}>
                 Eliminar
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
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  empty: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#777",
  },
  card: {
    backgroundColor: "#E3F2FD",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
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
  reagendar: {
    backgroundColor: "#2E7D32",
  },
  eliminar: {
    backgroundColor: "#D32F2F",
  },
  cerrar: {
    backgroundColor: "#757575",
  },
});