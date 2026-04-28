import React, { useState, useRef, useEffect, useContext } from "react";
import { View, Image, PanResponder, StyleSheet, Alert, Text } from "react-native";
import { EvaluationContext } from "../context/EvaluationContext";
import { Accelerometer } from "expo-sensors";

export default function VisionTestScreen({ setScreen, pacienteActual, setPacienteActual }) {
  const { guardarResultadoPrueba } = useContext(EvaluationContext);

  const totalImagenes = 7;

  const [imagenActual, setImagenActual] = useState(() => Math.floor(Math.random() * 4) + 1);
  const [restantes, setRestantes] = useState(totalImagenes);
  const [aciertos, setAciertos] = useState(0);
  const [fallos, setFallos] = useState(0);

  const imagenActualRef = useRef(imagenActual);

  useEffect(() => { imagenActualRef.current = imagenActual; }, [imagenActual]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(300);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const acc = Math.sqrt(x * x + y * y + z * z);
      if (acc > 2.2) resetear();
    });
    return () => sub && sub.remove();
  }, [restantes, aciertos, fallos]);

  const resetear = () => {
    setRestantes(totalImagenes);
    setAciertos(0);
    setFallos(0);
    setImagenActual(Math.floor(Math.random() * 4) + 1);
    Alert.alert("Reinicio", "La prueba fue reiniciada por sacudir el dispositivo");
  };

  const cambiarImagen = () => setImagenActual(Math.floor(Math.random() * 4) + 1);

  const finalizar = (a, f) => {
    const puntaje = a;

    let interpretacion = "";
    if (puntaje >= 6) interpretacion = "Agudeza visual adecuada";
    else if (puntaje >= 4) interpretacion = "Agudeza visual moderada";
    else interpretacion = "Agudeza visual baja";

    const resultado = {
      nombre: "Agudeza Visual",
      puntaje: puntaje,
      puntajeMax: totalImagenes,
      interpretacion: interpretacion,
      fecha: new Date().toLocaleDateString("es-MX"),
      hora: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      detalles: { aciertos: a, fallos: f, total: totalImagenes },
    };

    guardarResultadoPrueba("Vision", resultado);

    const nuevaEvaluacion = {
      tipo: "Agudeza Visual",
      fecha: new Date().toLocaleDateString(),
      puntaje: puntaje,
      detalle: { aciertos: a, fallos: f, total: totalImagenes, interpretacion },
    };

    setPacienteActual(prev => ({
      ...prev,
      pruebas: [...(prev?.pruebas || []), nuevaEvaluacion]
    }));

    Alert.alert("Prueba finalizada", `Puntaje: ${puntaje}/${totalImagenes}\n${interpretacion}`);
    setScreen("Agendar Cita");
  };

  const PanImagen = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        if (restantes <= 0) {
          finalizar(aciertos, fallos);
          return;
        }

        const umbral = 30;
        const dy = Math.abs(gestureState.dy);
        const dx = Math.abs(gestureState.dx);
        const imagenQueSeVe = imagenActualRef.current;

        let nuevoAcierto = aciertos;
        let nuevoFallo = fallos;

        if (dy > umbral && dy >= dx) {
          if ((gestureState.dy < 0 && imagenQueSeVe === 3) || (gestureState.dy > 0 && imagenQueSeVe === 4)) nuevoAcierto++;
          else nuevoFallo++;
        } else if (dx > umbral) {
          if ((gestureState.dx < 0 && imagenQueSeVe === 1) || (gestureState.dx > 0 && imagenQueSeVe === 2)) nuevoAcierto++;
          else nuevoFallo++;
        }

        const nuevosRestantes = restantes - 1;

        setAciertos(nuevoAcierto);
        setFallos(nuevoFallo);
        setRestantes(nuevosRestantes);

        if (nuevosRestantes === 0) {
          finalizar(nuevoAcierto, nuevoFallo);
        } else {
          cambiarImagen();
        }
      },
    })
  ).current;

  const getImagen = () => {
    switch(imagenActual) {
      case 1: return require("../assets/images/ELeft.png");
      case 2: return require("../assets/images/ERight.png");
      case 3: return require("../assets/images/ETop.png");
      case 4: return require("../assets/images/EBottom.png");
      default: return require("../assets/images/ELeft.png");
    }
  };

  return (
    <View style={styles.container} {...PanImagen.panHandlers}>
      <Text style={styles.info}>Desliza la E según su orientación</Text>
      <Image source={getImagen()} style={styles.image} />
      <Text style={styles.info}>Swipe izquierda, derecha, arriba o abajo</Text>
      <Text style={styles.info}>Restantes: {restantes} | Aciertos: {aciertos}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f4f6f8" },
  image: { width: 300, height: 300 },
  info: { fontSize: 16, textAlign: "center", marginVertical: 10 },
});