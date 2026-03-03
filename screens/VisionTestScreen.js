import React, { useState, useRef, useEffect } from "react";
import { View, Image, PanResponder, StyleSheet, Alert, Text } from "react-native";

export default function VisionTestScreen({ setScreen, pacienteActual, setPacienteActual }) {
  const totalImagenes = 7;
  let cImagenes = totalImagenes;
  let cAciertos = 0;
  let cFallos = 0;

  const [imagenActual, setImagenActual] = useState(() => Math.floor(Math.random() * 4) + 1);
  const imagenActualRef = useRef(imagenActual);

  useEffect(() => { imagenActualRef.current = imagenActual; }, [imagenActual]);

  const cambiarImagen = () => setImagenActual(Math.floor(Math.random() * 4) + 1);

  const PanImagen = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        if (cImagenes <= 0) {
          // Guardar resultado
          if (!pacienteActual) return;
          const nuevaEvaluacion = {
            tipo: "Agudeza Visual",
            fecha: new Date().toLocaleDateString(),
            puntaje: cAciertos,
            detalle: { aciertos: cAciertos, fallos: cFallos, total: totalImagenes },
          };
          setPacienteActual(prev => ({
            ...prev,
            pruebas: [...(prev.pruebas || []), nuevaEvaluacion]
          }));

          Alert.alert("Prueba finalizada", `Aciertos: ${cAciertos}, Fallos: ${cFallos}`);
          setScreen("Agendar Cita");
          return;
        }

        const umbral = 30;
        const dy = Math.abs(gestureState.dy);
        const dx = Math.abs(gestureState.dx);
        const imagenQueSeVe = imagenActualRef.current;

        if (dy > umbral && dy >= dx) {
          if ((gestureState.dy < 0 && imagenQueSeVe === 3) || (gestureState.dy > 0 && imagenQueSeVe === 4)) cAciertos++;
          else cFallos++;
        } else if (dx > umbral) {
          if ((gestureState.dx < 0 && imagenQueSeVe === 1) || (gestureState.dx > 0 && imagenQueSeVe === 2)) cAciertos++;
          else cFallos++;
        }
        cImagenes--;
        cambiarImagen();
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f4f6f8" },
  image: { width: 300, height: 300 },
  info: { fontSize: 16, textAlign: "center", marginVertical: 10 },
});