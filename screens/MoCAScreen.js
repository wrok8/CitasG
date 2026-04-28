import React, { useEffect, useState, useRef } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Accelerometer } from "expo-sensors";

import { FormField } from "../components/FormField";
import { FormSection } from "../components/FormSection";

export default function MoCAScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  const [isAccelActive, setIsAccelActive] = useState(false);
  const [instruccionActual, setInstruccionActual] = useState(0);
  const [tiempoInicio, setTiempoInicio] = useState(0);
  const [resultadoEjes, setResultadoEjes] = useState("");

  const [puntos, setPuntos] = useState({});
  const [puntosResta, setPuntosResta] = useState(0);

  // SENSOR PARA AGITAR Y LIMPIAR
  const shakeTimeout = useRef(null);

  const limpiarFormulario = () => {
    setPuntos({});
    setPuntosResta(0);
    setIsAccelActive(false);
    setInstruccionActual(0);
    setTiempoInicio(0);
    setResultadoEjes("");

    Alert.alert(
      "Formulario reiniciado",
      "Se limpiaron todas las respuestas 📱"
    );
  };

  const togglePunto = (id) => {
    setPuntos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const escolaridad = parseInt(
    pacienteActual?.escolaridad || 0
  );

  const rawScore = Object.entries(puntos).filter(
    ([key, val]) =>
      !key.startsWith("att_calc_") && val
  ).length;

  const adjustment =
    escolaridad >= 12 ? 1 : 0;

  const totalScore = Math.min(
    30,
    rawScore + puntosResta + adjustment
  );

  const getInterpretation = () => {
    if (totalScore >= 26) {
      return {
        text: "Se considera normal",
        color: "#5CB85C",
      };
    }

    return {
      text: "Probable trastorno cognitivo",
      color: "#D9534F",
    };
  };

  const interpretation =
    getInterpretation();

  // SENSOR DE LA PRUEBA DE EJES + SACUDIDA PARA LIMPIAR
  useEffect(() => {
    Accelerometer.setUpdateInterval(200);

    const sub = Accelerometer.addListener((data) => {
      const { x, y, z } = data;

      // SACUDIDA PARA LIMPIAR
      const totalForce = Math.sqrt(
        x * x + y * y + z * z
      );

      if (totalForce > 1.8) {
        if (!shakeTimeout.current) {
          limpiarFormulario();

          shakeTimeout.current = setTimeout(() => {
            shakeTimeout.current = null;
          }, 2000);
        }
      }

      // PRUEBA DE EJES
      if (isAccelActive) {
        if (
          instruccionActual === 1 &&
          x > 0.5
        ) {
          setInstruccionActual(2);
        } else if (
          instruccionActual === 2 &&
          x < -0.5
        ) {
          setInstruccionActual(3);
        } else if (
          instruccionActual === 3 &&
          z < -0.5
        ) {
          const tiempo = (
            (Date.now() - tiempoInicio) /
            1000
          ).toFixed(1);

          setResultadoEjes(
            `Prueba completada correctamente en ${tiempo} segundos`
          );

          setInstruccionActual(4);
          setIsAccelActive(false);
        }
      }
    });

    return () => sub.remove();
  }, [
    isAccelActive,
    instruccionActual,
    tiempoInicio,
  ]);

  const iniciarPruebaEjes = () => {
    setInstruccionActual(1);
    setTiempoInicio(Date.now());
    setIsAccelActive(true);
    setResultadoEjes("");
  };

  const guardarPrueba = () => {
    if (!pacienteActual) {
      Alert.alert(
        "Error",
        "No hay paciente seleccionado"
      );
      return;
    }

    const nuevaPrueba = {
      tipo: "MoCA",
      fecha: new Date().toLocaleDateString(),
      puntaje: totalScore,
      maximo: 30,
      detalle: [
        `Puntaje bruto: ${rawScore}`,
        `Restas seriadas: ${puntosResta}`,
        `Ajuste escolaridad: ${adjustment}`,
        `Resultado: ${interpretation.text}`,
      ],
    };

    const pruebasActualizadas = Array.isArray(
      pacienteActual.pruebas
    )
      ? [...pacienteActual.pruebas, nuevaPrueba]
      : [nuevaPrueba];

    const pacienteActualizado = {
      ...pacienteActual,
      pruebas: pruebasActualizadas,
    };

    setPacienteActual(pacienteActualizado);

    Alert.alert(
      "Evaluación guardada",
      `Puntaje total: ${totalScore}/30`,
      [
        {
          text: "OK",
          onPress: () => {
            setScreen("Agendar Cita");
          },
        },
      ]
    );
  };

  const ScoreSwitch = ({
    label,
    id,
  }) => (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>
        {label}
      </Text>

      <Switch
        value={!!puntos[id]}
        onValueChange={() =>
          togglePunto(id)
        }
      />
    </View>
  );

  const ScoreOption = ({
    label,
    value,
  }) => {
    const isSelected =
      puntosResta === value;

    return (
      <TouchableOpacity
        style={[
          styles.scoreRow,
          isSelected &&
            styles.selectedOption,
        ]}
        onPress={() =>
          setPuntosResta(
            isSelected ? 0 : value
          )
        }
      >
        <Text style={styles.scoreLabel}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
      >
        <Text style={styles.title}>
          Evaluación MoCA
        </Text>

        {/* TU PRUEBA DE EJES */}
        <FormSection
          title="Prueba de ejes"
          subtitle="Sensor interactivo"
        >
          <View
            style={{
              backgroundColor: "#F1F3F5",
              padding: 15,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                marginBottom: 10,
                fontSize: 16,
              }}
            >
              Pida al paciente que sostenga el dispositivo y siga las instrucciones.
            </Text>

            {instruccionActual === 0 && (
              <TouchableOpacity
                style={styles.btnAction}
                onPress={iniciarPruebaEjes}
              >
                <Text style={styles.btnTextAction}>
                  Iniciar prueba
                </Text>
              </TouchableOpacity>
            )}

            {instruccionActual === 1 && (
              <Text style={styles.instructionText}>
                Incline el dispositivo a la IZQUIERDA
              </Text>
            )}

            {instruccionActual === 2 && (
              <Text style={styles.instructionText}>
                Ahora inclínelo a la DERECHA
              </Text>
            )}

            {instruccionActual === 3 && (
              <Text style={styles.instructionText}>
                Ahora coloque la pantalla HACIA ABAJO
              </Text>
            )}

            {instruccionActual === 4 && (
              <View>
                <Text
                  style={{
                    fontSize: 18,
                    color: "#5CB85C",
                    fontWeight: "bold",
                    textAlign: "center",
                    marginVertical: 10,
                  }}
                >
                  {resultadoEjes}
                </Text>

                <TouchableOpacity
                  style={styles.btnAction}
                  onPress={iniciarPruebaEjes}
                >
                  <Text style={styles.btnTextAction}>
                    Reintentar prueba
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </FormSection>

        {/* IDENTIFICACIÓN */}
        <FormSection
          title="Identificación"
          subtitle="3 puntos"
        >
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <Image
                source={require("../assets/leon.jpg")}
                style={styles.imageAnimal}
              />
              <ScoreSwitch label="León" id="lion" />
            </View>

            <View style={{ flex: 1 }}>
              <Image
                source={require("../assets/rinoceronte.jpg")}
                style={styles.imageAnimal}
              />
              <ScoreSwitch label="Rinoceronte" id="rhino" />
            </View>

            <View style={{ flex: 1 }}>
              <Image
                source={require("../assets/camello.jpg")}
                style={styles.imageAnimal}
              />
              <ScoreSwitch label="Camello" id="camel" />
            </View>
          </View>
        </FormSection>

        {/* ATENCIÓN */}
        <FormSection title="Atención" subtitle="6 puntos">
          <ScoreSwitch label="Secuencia directa" id="dir" />
          <ScoreSwitch label="Secuencia inversa" id="inv" />
          <ScoreSwitch label="Serie letras" id="letters" />
          <ScoreOption label="4-5 restas correctas (3 pts)" value={3} />
          <ScoreOption label="2-3 restas correctas (2 pts)" value={2} />
          <ScoreOption label="1 correcta (1 pt)" value={1} />
        </FormSection>

        {/* ORIENTACIÓN */}
        <FormSection title="Orientación" subtitle="6 puntos">
          <ScoreSwitch label="Fecha" id="fecha" />
          <ScoreSwitch label="Mes" id="mes" />
          <ScoreSwitch label="Año" id="anio" />
          <ScoreSwitch label="Lugar" id="lugar" />
          <ScoreSwitch label="Ciudad" id="ciudad" />
          <ScoreSwitch label="Día" id="dia" />
        </FormSection>

        {/* VISUOESPACIAL */}
        <FormSection title="Visuoespacial / Ejecutiva" subtitle="5 puntos">
          <ScoreSwitch label="Conectar puntos" id="visuo_1" />
          <ScoreSwitch label="Copiar cubo" id="visuo_2" />
          <ScoreSwitch label="Reloj: contorno" id="visuo_3" />
          <ScoreSwitch label="Reloj: números" id="visuo_4" />
          <ScoreSwitch label="Reloj: manecillas" id="visuo_5" />
        </FormSection>

        {/* LENGUAJE */}
        <FormSection title="Lenguaje" subtitle="3 puntos">
          <ScoreSwitch label="Frase 1 correcta" id="lang_1" />
          <ScoreSwitch label="Frase 2 correcta" id="lang_2" />
          <ScoreSwitch label="Fluidez verbal" id="lang_3" />
        </FormSection>

        {/* ABSTRACCIÓN */}
        <FormSection title="Abstracción" subtitle="2 puntos">
          <ScoreSwitch label="Tren / bicicleta" id="abs_1" />
          <ScoreSwitch label="Reloj / regla" id="abs_2" />
        </FormSection>

        {/* RECUERDO */}
        <FormSection title="Recuerdo diferido" subtitle="5 puntos">
          <ScoreSwitch label="Rostro" id="rec_1" />
          <ScoreSwitch label="Seda" id="rec_2" />
          <ScoreSwitch label="Iglesia" id="rec_3" />
          <ScoreSwitch label="Clavel" id="rec_4" />
          <ScoreSwitch label="Rojo" id="rec_5" />
        </FormSection>

        {/* RESULTADO */}
        <FormSection title="Resultado Final" subtitle="">
          <Text style={styles.scoreText}>
            {totalScore} / 30
          </Text>

          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  interpretation.color,
              },
            ]}
          >
            <Text style={styles.badgeText}>
              {interpretation.text}
            </Text>
          </View>
        </FormSection>

        <TouchableOpacity
          style={styles.btnSubmit}
          onPress={guardarPrueba}
        >
          <Text style={styles.btnTextSubmit}>
            GUARDAR EVALUACIÓN
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  scoreLabel: {
    flex: 1,
  },
  btnAction: {
    backgroundColor: "#005f73",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnTextAction: {
    color: "white",
    fontWeight: "bold",
  },
  btnSubmit: {
    backgroundColor: "#1565C0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  btnTextSubmit: {
    color: "white",
    fontWeight: "bold",
  },
  scoreText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  badge: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
  },
  selectedOption: {
    backgroundColor: "#E7F0FF",
  },
  imageAnimal: {
    width: "100%",
    height: 100,
    resizeMode: "contain",
  },
  instructionText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
});