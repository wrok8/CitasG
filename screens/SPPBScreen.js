import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Accelerometer } from "expo-sensors";

export default function SPPBScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  const [puntosEquilibrio, setPuntosEquilibrio] = useState(0);
  const [puntosMarcha, setPuntosMarcha] = useState(0);
  const [puntosSilla, setPuntosSilla] = useState(0);
  const [ultimoMovimiento, setUltimoMovimiento] = useState(0);

  const total =
    puntosEquilibrio +
    puntosMarcha +
    puntosSilla;

  const interpretacion =
    total <= 6
      ? "FRAGILIDAD SEVERA"
      : total <= 9
      ? "ALTO RIESGO DE FRAGILIDAD"
      : total <= 11
      ? "RIESGO MODERADO"
      : "DESEMPEÑO NORMAL";

  const limpiarEvaluacion = () => {
    setPuntosEquilibrio(0);
    setPuntosMarcha(0);
    setPuntosSilla(0);

    Alert.alert(
      "Evaluación reiniciada",
      "Los puntajes fueron limpiados por movimiento."
    );
  };

  useEffect(() => {
    Accelerometer.setUpdateInterval(300);

    const subscription =
      Accelerometer.addListener(
        ({ x, y, z }) => {
          const fuerza =
            Math.abs(x) +
            Math.abs(y) +
            Math.abs(z);

          if (fuerza > 2.5) {
            const ahora = Date.now();

            if (
              ahora -
                ultimoMovimiento >
              2000
            ) {
              setUltimoMovimiento(
                ahora
              );
              limpiarEvaluacion();
            }
          }
        }
      );

    return () =>
      subscription.remove();
  }, [ultimoMovimiento]);

  const guardarEvaluacion = () => {
    if (!pacienteActual) {
      Alert.alert(
        "Error",
        "No hay paciente seleccionado"
      );
      return;
    }

    const nuevaPrueba = {
      tipo: "SPPB",
      fecha:
        new Date().toLocaleDateString(),
      puntaje: total,
      detalle: [
        `Equilibrio: ${puntosEquilibrio}/4`,
        `Velocidad de marcha: ${puntosMarcha}/4`,
        `Levantarse de silla: ${puntosSilla}/4`,
        `Interpretación: ${interpretacion}`,
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
      "Evaluación guardada",
      `Puntaje: ${total}/12 — ${interpretacion}`,
      [
        {
          text: "OK",
          onPress: () =>
            setScreen(
              "Agendar Cita"
            ),
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        style={styles.container}
      >
        {pacienteActual?.nombre && (
          <View
            style={
              styles.pacienteBanner
            }
          >
            <Text
              style={
                styles.pacienteTexto
              }
            >
              👤 Paciente:{" "}
              {
                pacienteActual.nombre
              }
            </Text>
          </View>
        )}

        <Text
          style={
            styles.headerTitle
          }
        >
          Batería de Desempeño
          Físico (SPPB)
        </Text>

        <View style={styles.card}>
          <Text
            style={
              styles.sectionTitle
            }
          >
            1. Pruebas de
            Equilibrio
          </Text>

          <Text
            style={
              styles.sectionHint
            }
          >
            Selecciona el
            resultado obtenido
          </Text>

          <RadioItem
            label="No pudo completar / menos de 10 seg"
            sublabel="0 puntos"
            value={0}
            selected={
              puntosEquilibrio
            }
            onSelect={
              setPuntosEquilibrio
            }
          />

          <RadioItem
            label="Pies juntos y semitándem completados"
            sublabel="2 puntos"
            value={2}
            selected={
              puntosEquilibrio
            }
            onSelect={
              setPuntosEquilibrio
            }
          />

          <RadioItem
            label="Completó todas las posiciones (tándem incluido)"
            sublabel="4 puntos"
            value={4}
            selected={
              puntosEquilibrio
            }
            onSelect={
              setPuntosEquilibrio
            }
          />
        </View>

        <View style={styles.card}>
          <Text
            style={
              styles.sectionTitle
            }
          >
            2. Velocidad de la
            Marcha (4 m)
          </Text>

          <Text
            style={
              styles.sectionHint
            }
          >
            Tiempo que tardó en
            recorrer 4 metros
          </Text>

          <RadioItem
            label="Más de 8.7 segundos"
            sublabel="1 punto"
            value={1}
            selected={
              puntosMarcha
            }
            onSelect={
              setPuntosMarcha
            }
          />

          <RadioItem
            label="Entre 6.21 y 8.7 segundos"
            sublabel="2 puntos"
            value={2}
            selected={
              puntosMarcha
            }
            onSelect={
              setPuntosMarcha
            }
          />

          <RadioItem
            label="Entre 4.82 y 6.20 segundos"
            sublabel="3 puntos"
            value={3}
            selected={
              puntosMarcha
            }
            onSelect={
              setPuntosMarcha
            }
          />

          <RadioItem
            label="Menos de 4.82 segundos"
            sublabel="4 puntos"
            value={4}
            selected={
              puntosMarcha
            }
            onSelect={
              setPuntosMarcha
            }
          />
        </View>

        <View style={styles.card}>
          <Text
            style={
              styles.sectionTitle
            }
          >
            3. Levantarse de la
            Silla (5 veces)
          </Text>

          <Text
            style={
              styles.sectionHint
            }
          >
            Sin usar los brazos
          </Text>

          <RadioItem
            label="No pudo / más de 60 segundos"
            sublabel="0 puntos"
            value={0}
            selected={
              puntosSilla
            }
            onSelect={
              setPuntosSilla
            }
          />

          <RadioItem
            label="Más de 16.7 segundos"
            sublabel="1 punto"
            value={1}
            selected={
              puntosSilla
            }
            onSelect={
              setPuntosSilla
            }
          />

          <RadioItem
            label="Entre 13.7 y 16.6 segundos"
            sublabel="2 puntos"
            value={2}
            selected={
              puntosSilla
            }
            onSelect={
              setPuntosSilla
            }
          />

          <RadioItem
            label="Entre 11.2 y 13.6 segundos"
            sublabel="3 puntos"
            value={3}
            selected={
              puntosSilla
            }
            onSelect={
              setPuntosSilla
            }
          />

          <RadioItem
            label="Menos de 11.1 segundos"
            sublabel="4 puntos"
            value={4}
            selected={
              puntosSilla
            }
            onSelect={
              setPuntosSilla
            }
          />
        </View>

        <View
          style={[
            styles.resultCard,
            total <= 6
              ? styles.severo
              : total <= 9
              ? styles.alto
              : total <= 11
              ? styles.moderado
              : styles.normal,
          ]}
        >
          <Text
            style={
              styles.resultPuntaje
            }
          >
            Puntaje: {total} /
            12
          </Text>

          <Text
            style={
              styles.resultInterpretacion
            }
          >
            {interpretacion}
          </Text>

          <View
            style={
              styles.desglose
            }
          >
            <Text
              style={
                styles.desgloseItem
              }
            >
              ⚖️ Equilibrio:{" "}
              {
                puntosEquilibrio
              }
              /4
            </Text>

            <Text
              style={
                styles.desgloseItem
              }
            >
              🚶 Marcha:{" "}
              {puntosMarcha}/4
            </Text>

            <Text
              style={
                styles.desgloseItem
              }
            >
              🪑 Silla:{" "}
              {puntosSilla}/4
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={
            styles.saveButton
          }
          onPress={
            guardarEvaluacion
          }
        >
          <Text
            style={
              styles.saveButtonText
            }
          >
            GUARDAR Y AGENDAR
            CITA
          </Text>
        </TouchableOpacity>

        <View
          style={{ height: 40 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function RadioItem({
  label,
  sublabel,
  value,
  selected,
  onSelect,
}) {
  const isSelected =
    selected === value;

  return (
    <TouchableOpacity
      style={[
        styles.radioItem,
        isSelected &&
          styles.radioSelected,
      ]}
      onPress={() =>
        onSelect(value)
      }
    >
      <View
        style={styles.radioRow}
      >
        <View
          style={[
            styles.radioDot,
            isSelected &&
              styles.radioDotSelected,
          ]}
        />

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.radioLabel,
              isSelected &&
                styles.radioLabelSelected,
            ]}
          >
            {label}
          </Text>

          <Text
            style={[
              styles.radioSublabel,
              isSelected &&
                styles.radioSublabelSelected,
            ]}
          >
            {sublabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      "#f0f2f5",
  },
  container: {
    flex: 1,
    padding: 15,
  },
  pacienteBanner: {
    backgroundColor:
      "#E3F2FD",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    alignItems: "center",
  },
  pacienteTexto: {
    fontWeight: "bold",
    color: "#0D47A1",
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1A237E",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#6200ee",
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: "#888",
    marginBottom: 12,
    fontStyle: "italic",
  },
  radioItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginVertical: 4,
  },
  radioSelected: {
    backgroundColor:
      "#6200ee",
    borderColor: "#6200ee",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#aaa",
    backgroundColor: "#fff",
  },
  radioDotSelected: {
    borderColor: "#fff",
    backgroundColor: "#fff",
  },
  radioLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  radioLabelSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  radioSublabel: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  radioSublabelSelected: {
    color: "#ddd",
  },
  resultCard: {
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
  },
  severo: {
    backgroundColor:
      "#ffebee",
  },
  alto: {
    backgroundColor:
      "#fff3e0",
  },
  moderado: {
    backgroundColor:
      "#fffde7",
  },
  normal: {
    backgroundColor:
      "#e8f5e9",
  },
  resultPuntaje: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
  },
  resultInterpretacion: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 14,
  },
  desglose: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  desgloseItem: {
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor:
      "#1565C0",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});