import { Accelerometer } from "expo-sensors";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AudicionScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  const [combDerecho, setCombDerecho] = useState("");
  const [combIzquierdo, setCombIzquierdo] = useState("");
  const [resultadoDerecho, setResultadoDerecho] = useState(null);
  const [resultadoIzquierdo, setResultadoIzquierdo] = useState(null);

  const generarCombinacion = () => {
    const caracteres =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let resultado = [];

    for (let i = 0; i < 3; i++) {
      const randomIndice = Math.floor(
        Math.random() * caracteres.length
      );

      resultado.push(
        caracteres.charAt(randomIndice)
      );
    }

    return resultado.join("-");
  };

  useEffect(() => {
    setCombDerecho(generarCombinacion());
    setCombIzquierdo(generarCombinacion());
  }, []);

  useEffect(() => {
    const subscription =
      Accelerometer.addListener((data) => {
        const totalForce =
          Math.abs(data.x) +
          Math.abs(data.y) +
          Math.abs(data.z);

        if (totalForce > 2.5) {
          if (resultadoDerecho === null) {
            setCombDerecho(
              generarCombinacion()
            );
          }

          if (resultadoIzquierdo === null) {
            setCombIzquierdo(
              generarCombinacion()
            );
          }
        }
      });

    Accelerometer.setUpdateInterval(100);

    return () => subscription.remove();
  }, [
    resultadoDerecho,
    resultadoIzquierdo,
  ]);

  const guardarPrueba = () => {
    if (!pacienteActual) {
      Alert.alert(
        "Error",
        "No hay paciente seleccionado"
      );
      return;
    }

    if (
      resultadoDerecho === null ||
      resultadoIzquierdo === null
    ) {
      Alert.alert(
        "Atención",
        "Debes evaluar ambos oídos"
      );
      return;
    }

    let diagnostico = "";
    let puntaje = 0;

    if (
      resultadoDerecho &&
      resultadoIzquierdo
    ) {
      diagnostico =
        "Audición normal en ambos oídos";
      puntaje = 2;
    } else if (
      !resultadoDerecho &&
      !resultadoIzquierdo
    ) {
      diagnostico =
        "Falla detectada en ambos oídos";
      puntaje = 0;
    } else if (!resultadoDerecho) {
      diagnostico =
        "Falla detectada en oído derecho";
      puntaje = 1;
    } else {
      diagnostico =
        "Falla detectada en oído izquierdo";
      puntaje = 1;
    }

    const nuevaPrueba = {
      tipo: "Prueba del Susurro",
      fecha:
        new Date().toLocaleDateString(),
      puntaje,
      detalle: [
        "Oído derecho: " +
          (resultadoDerecho
            ? "Sí logró"
            : "No logró"),
        "Oído izquierdo: " +
          (resultadoIzquierdo
            ? "Sí logró"
            : "No logró"),
        "Diagnóstico: " +
          diagnostico,
      ],
    };

    setPacienteActual((prev) => ({
      ...prev,
      pruebas: [
        ...(prev?.pruebas || []),
        nuevaPrueba,
      ],
    }));

    Alert.alert(
      "Prueba Guardada",
      diagnostico
    );

    setResultadoDerecho(null);
    setResultadoIzquierdo(null);

    setCombDerecho(
      generarCombinacion()
    );
    setCombIzquierdo(
      generarCombinacion()
    );

    setScreen("Agendar Cita");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
      />

      <ScrollView
        style={styles.formContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            Prueba del Susurro
          </Text>

          <Text style={styles.subtitle}>
            Agudeza Auditiva
          </Text>
        </View>

        <Text
          style={styles.seccionIndicaciones}
        >
          Indicaciones
        </Text>

        <View style={styles.indicaciones}>
          <Text>
            • Colóquese detrás del
            paciente
          </Text>
          <Text>
            • Mantenga distancia de 1
            metro
          </Text>
          <Text>
            • Susurre la combinación
          </Text>
          <Text>
            • Si falla, agite el
            teléfono
          </Text>
        </View>

        {/* OÍDO DERECHO */}
        <View
          style={
            styles.evaluacionSection
          }
        >
          <Text
            style={styles.sectionTitle}
          >
            Evaluación Oído Derecho
          </Text>

          <View
            style={
              styles.generadorContainer
            }
          >
            <Text
              style={
                styles.combinacionTexto
              }
            >
              {combDerecho}
            </Text>
          </View>

          <View
            style={
              styles.botonesResultado
            }
          >
            <TouchableOpacity
              style={[
                styles.btnPasa,
                resultadoDerecho ===
                  true &&
                  styles.btnPasaActivo,
              ]}
              onPress={() =>
                setResultadoDerecho(
                  true
                )
              }
            >
              <Text
                style={
                  styles.btnResTexto
                }
              >
                Sí logró
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btnFalla,
                resultadoDerecho ===
                  false &&
                  styles.btnFallaActivo,
              ]}
              onPress={() =>
                setResultadoDerecho(
                  false
                )
              }
            >
              <Text
                style={
                  styles.btnResTexto
                }
              >
                No logró
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* OÍDO IZQUIERDO */}
        <View
          style={
            styles.evaluacionSection
          }
        >
          <Text
            style={styles.sectionTitle}
          >
            Evaluación Oído Izquierdo
          </Text>

          <View
            style={
              styles.generadorContainer
            }
          >
            <Text
              style={
                styles.combinacionTexto
              }
            >
              {combIzquierdo}
            </Text>
          </View>

          <View
            style={
              styles.botonesResultado
            }
          >
            <TouchableOpacity
              style={[
                styles.btnPasa,
                resultadoIzquierdo ===
                  true &&
                  styles.btnPasaActivo,
              ]}
              onPress={() =>
                setResultadoIzquierdo(
                  true
                )
              }
            >
              <Text
                style={
                  styles.btnResTexto
                }
              >
                Sí logró
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btnFalla,
                resultadoIzquierdo ===
                  false &&
                  styles.btnFallaActivo,
              ]}
              onPress={() =>
                setResultadoIzquierdo(
                  false
                )
              }
            >
              <Text
                style={
                  styles.btnResTexto
                }
              >
                No logró
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.btnGuardar}
          onPress={guardarPrueba}
        >
          <Text
            style={
              styles.btnGuardarTexto
            }
          >
            GUARDAR PRUEBA
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 18,
    color: "#00A8E8",
    marginTop: 5,
  },
  seccionIndicaciones: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6A0DAD",
    marginBottom: 10,
  },
  indicaciones: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  evaluacionSection: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6A0DAD",
    textAlign: "center",
    marginBottom: 15,
  },
  generadorContainer: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  combinacionTexto: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 3,
  },
  botonesResultado: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btnPasa: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginRight: 5,
    alignItems: "center",
  },
  btnFalla: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: "center",
  },
  btnPasaActivo: {
    backgroundColor: "#4CAF50",
  },
  btnFallaActivo: {
    backgroundColor: "#F44336",
  },
  btnResTexto: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#666",
  },
  btnGuardar: {
    backgroundColor: "#6A0DAD",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 40,
  },
  btnGuardarTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});