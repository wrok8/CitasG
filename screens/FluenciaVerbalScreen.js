import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { Accelerometer } from "expo-sensors";

const FluenciaVerbalScreen = ({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) => {
  const [palabra, setPalabra] = useState("");
  const [palabras, setPalabras] = useState([]);
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [activo, setActivo] = useState(false);

  // 📱 referencia para evitar múltiples reinicios seguidos
  const shakeTimeout = useRef(null);

  // 🧹 limpiar prueba al agitar
  const limpiarPrueba = () => {
    setPalabra("");
    setPalabras([]);
    setTiempoRestante(60);
    setActivo(false);

    Alert.alert(
      "Prueba reiniciada",
      "Agitaste el teléfono 📱"
    );
  };

  // 📱 sensor de sacudida
  useEffect(() => {
    Accelerometer.setUpdateInterval(300);

    const subscription = Accelerometer.addListener(
      ({ x, y, z }) => {
        const fuerza = Math.sqrt(
          x * x + y * y + z * z
        );

        if (fuerza > 1.8) {
          if (!shakeTimeout.current) {
            limpiarPrueba();

            shakeTimeout.current = setTimeout(() => {
              shakeTimeout.current = null;
            }, 2000);
          }
        }
      }
    );

    return () => subscription.remove();
  }, []);

  // ⏱ Temporizador
  useEffect(() => {
    let intervalo;

    if (activo && tiempoRestante > 0) {
      intervalo = setInterval(() => {
        setTiempoRestante((prev) => prev - 1);
      }, 1000);
    }

    if (tiempoRestante === 0 && activo) {
      finalizarPrueba();
    }

    return () => clearInterval(intervalo);
  }, [activo, tiempoRestante]);

  // ➕ Agregar palabra
  const agregarPalabra = () => {
    if (palabra.trim() === "") return;

    setPalabras([...palabras, palabra.trim()]);
    setPalabra("");
  };

  // ▶ Iniciar prueba
  const iniciarPrueba = () => {
    setPalabras([]);
    setTiempoRestante(60);
    setActivo(true);
  };

  // ⏹ Finalizar prueba
  const finalizarPrueba = () => {
    setActivo(false);

    if (!pacienteActual) {
      Alert.alert("Error", "No hay paciente seleccionado");
      return;
    }

    const nuevaEvaluacion = {
      tipo: "Fluencia Verbal - Animales",
      fecha: new Date().toLocaleDateString(),
      puntaje: palabras.length,
      detalle: palabras,
    };

    // 🔥 Guardar en paciente.pruebas
    setPacienteActual((prev) => ({
      ...prev,
      pruebas: [...(prev?.pruebas || []), nuevaEvaluacion],
    }));

    Alert.alert(
      "Prueba Finalizada",
      `Se registraron ${palabras.length} palabras`
    );

    setScreen("Agendar Cita");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        Fluencia Verbal - Animales
      </Text>

      <Text style={styles.timer}>
        Tiempo restante: {tiempoRestante}s
      </Text>

      <Text style={styles.avisoSensor}>
        📱 Agita el dispositivo para limpiar
      </Text>

      {!activo ? (
        <TouchableOpacity
          style={styles.botonIniciar}
          onPress={iniciarPrueba}
        >
          <Text style={styles.botonTexto}>
            Iniciar Prueba
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Escribe un animal..."
            value={palabra}
            onChangeText={setPalabra}
            onSubmitEditing={agregarPalabra}
          />

          <TouchableOpacity
            style={styles.botonAgregar}
            onPress={agregarPalabra}
          >
            <Text style={styles.botonTexto}>
              Agregar
            </Text>
          </TouchableOpacity>

          <FlatList
            data={palabras}
            keyExtractor={(item, index) =>
              index.toString()
            }
            renderItem={({ item }) => (
              <Text style={styles.item}>
                • {item}
              </Text>
            )}
            style={styles.lista}
          />

          <TouchableOpacity
            style={styles.botonFinalizar}
            onPress={finalizarPrueba}
          >
            <Text style={styles.botonTexto}>
              Finalizar
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default FluenciaVerbalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f6f8",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  timer: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  avisoSensor: {
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
    fontStyle: "italic",
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  botonIniciar: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  botonAgregar: {
    backgroundColor: "#1565C0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  botonFinalizar: {
    backgroundColor: "#C62828",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  botonTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  lista: {
    maxHeight: 200,
    marginTop: 10,
  },
  item: {
    fontSize: 16,
    marginVertical: 3,
  },
});