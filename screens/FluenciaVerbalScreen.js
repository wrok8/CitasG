import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { EvaluationContext } from "../context/EvaluationContext";

const FluenciaVerbalScreen = ({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) => {
  // ⭐ AGREGAR CONTEXT
  const { guardarResultadoPrueba } = useContext(EvaluationContext);

  const [palabra, setPalabra] = useState("");
  const [palabras, setPalabras] = useState([]);
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [activo, setActivo] = useState(false);

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

  // ⭐ FUNCIÓN PARA CALCULAR PUNTAJE
  const calcularPuntaje = () => {
    // El puntaje es la cantidad de palabras válidas
    // En una prueba real habría que validar que sean animales
    // Por ahora contamos todas las palabras ingresadas
    return palabras.length;
  };

  // ⭐ FUNCIÓN PARA OBTENER INTERPRETACIÓN
  const obtenerInterpretacion = (puntaje) => {
    if (puntaje >= 15) return "Fluencia normal o superior";
    if (puntaje >= 10) return "Fluencia normal";
    if (puntaje >= 5) return "Fluencia leve";
    return "Fluencia reducida";
  };

  // ⏹ Finalizar prueba
  const finalizarPrueba = () => {
    setActivo(false);

    // ⭐ CALCULAR PUNTAJE
    const puntajeTotal = calcularPuntaje();
    const interpretacion = obtenerInterpretacion(puntajeTotal);

    // ⭐ CREAR OBJETO RESULTADO
    const resultado = {
      nombre: "Fluencia Verbal",
      puntaje: puntajeTotal,
      puntajeMax: 40, // Valor referencial máximo típico
      interpretacion: interpretacion,
      fecha: new Date().toLocaleDateString("es-MX"),
      hora: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      detalles: {
        categoria: "Animales",
        palabras: palabras,
        tiempoLimite: 60,
      },
    };

    // ⭐ GUARDAR EN CONTEXT
    guardarResultadoPrueba("Fluencia Verbal", resultado);

    // Guardar también en pacienteActual si existe
    if (pacienteActual) {
      const nuevaEvaluacion = {
        tipo: "Fluencia Verbal - Animales",
        fecha: new Date().toLocaleDateString(),
        puntaje: puntajeTotal,
        detalle: palabras,
      };

      // 🔥 Guardar en paciente.pruebas
      setPacienteActual((prev) => ({
        ...prev,
        pruebas: [...(prev?.pruebas || []), nuevaEvaluacion],
      }));
    }

    Alert.alert(
      "✅ Prueba Finalizada",
      `Se registraron ${puntajeTotal} palabras\n${interpretacion}`
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
            keyExtractor={(item, index) => index.toString()}
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
    marginBottom: 20,
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