import React, { useState, useContext } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { EvaluationContext } from "../context/EvaluationContext";

export default function LawtonScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  const { guardarResultadoPrueba } = useContext(EvaluationContext);

  const [respuestas, setRespuestas] = useState({
    telefono: null,
    transporte: null,
    medicacion: null,
    finanzas: null,
    compras: null,
    cocina: null,
    hogar: null,
    lavanderia: null,
  });

  const seleccionar = (campo, valor) => {
    setRespuestas({ ...respuestas, [campo]: valor });
  };

  const calcularPuntaje = () => {
    let total = 0;
    Object.values(respuestas).forEach((valor) => {
      if (valor === true) total += 1;
    });
    return total;
  };

  const interpretarResultado = (puntaje) => {
    if (puntaje >= 7) return "Independencia funcional";
    if (puntaje >= 4) return "Dependencia leve-moderada";
    return "Dependencia severa";
  };

  const guardarEvaluacion = () => {
    if (Object.values(respuestas).includes(null)) {
      Alert.alert("Error", "Debe responder todas las preguntas");
      return;
    }

    const puntajeFinal = calcularPuntaje();
    const interpretacion = interpretarResultado(puntajeFinal);

    const resultado = {
      nombre: "Lawton",
      puntaje: puntajeFinal,
      puntajeMax: 8,
      interpretacion: interpretacion,
      fecha: new Date().toLocaleDateString("es-MX"),
      hora: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      detalles: respuestas,
    };

    guardarResultadoPrueba("Lawton", resultado);

    const nuevaEvaluacion = {
      tipo: "Índice de Lawton",
      fecha: new Date().toLocaleDateString(),
      puntaje: puntajeFinal,
      detalle: {
        ...respuestas,
        interpretacion,
      },
    };

    setPacienteActual((prev) => ({
      ...prev,
      pruebas: [...(prev?.pruebas || []), nuevaEvaluacion],
    }));

    Alert.alert(
      "Evaluación Guardada",
      `Puntaje: ${puntajeFinal}/8\nResultado: ${interpretacion}`
    );

    setScreen("Agendar Cita");
  };

  const Item = ({ numero, titulo, campo, descripcion }) => (
    <>
      <Text style={styles.titulo}>
        {numero}) {titulo}
      </Text>

      <Text style={styles.parrafo}>{descripcion}</Text>

      <View style={styles.opciones}>
        <TouchableOpacity
          style={[
            styles.boton,
            respuestas[campo] === true && styles.botonSi,
          ]}
          onPress={() => seleccionar(campo, true)}
        >
          <Text style={styles.textoBoton}>Sí</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.boton,
            respuestas[campo] === false && styles.botonNo,
          ]}
          onPress={() => seleccionar(campo, false)}
        >
          <Text style={styles.textoBoton}>No</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.separador} />
    </>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Índice de Lawton</Text>

      <Item
        numero="1"
        titulo="Capacidad para usar teléfono"
        campo="telefono"
        descripcion={`Sí: Lo opera por iniciativa propia, lo marca sin problemas.\nSí: Marca sólo unos cuantos números bien conocidos.\nSí: Contesta el teléfono pero no llama.\nNo: No usa el teléfono.`}
      />

      <Item
        numero="2"
        titulo="Transporte"
        campo="transporte"
        descripcion={`Sí: Se transporta solo/a.\nSí: Se transporta solo/a, únicamente en taxi pero no puede usar otros recursos.\nSí: Viaja en transporte colectivo acompañado.\nNo: Viaja en taxi o auto acompañado.\nNo: No sale.`}
      />

      <Item
        numero="3"
        titulo="Medicación"
        campo="medicacion"
        descripcion={`Sí: Es capaz de tomarla a su hora y dosis correctas.\nSí: Se hace responsable sólo si le preparan por adelantado.\nNo: Es incapaz de hacerse cargo.`}
      />

      <Item
        numero="4"
        titulo="Finanzas"
        campo="finanzas"
        descripcion={`Sí: Maneja sus asuntos independientemente.\nNo: Sólo puede manejar lo necesario para pequeñas compras.\nNo: Es incapaz de manejar dinero.`}
      />

      <Item
        numero="5"
        titulo="Compras"
        campo="compras"
        descripcion={`Sí: Vigila sus necesidades independientemente.\nSí: Hace independientemente sólo pequeñas compras.\nNo: Necesita compañía para cualquier compra.\nNo: Incapaz de cualquier compra.`}
      />

      <Item
        numero="6"
        titulo="Cocina"
        campo="cocina"
        descripcion={`Sí: Planea, prepara y sirve los alimentos correctamente.\nNo: Prepara los alimentos sólo si se le provee lo necesario.\nNo: Calienta, sirve y prepara pero no lleva una dieta adecuada.\nNo: Necesita que le preparen los alimentos.`}
      />

      <Item
        numero="7"
        titulo="Cuidado del hogar"
        campo="hogar"
        descripcion={`Sí: Mantiene la casa solo o con ayuda mínima.\nSí: Efectúa diariamente trabajo ligero eficientemente.\nSí: Efectúa diariamente trabajo ligero sin eficiencia.\nNo: Necesita ayuda en todas las actividades.\nNo: No participa.`}
      />

      <Item
        numero="8"
        titulo="Lavandería"
        campo="lavanderia"
        descripcion={`Sí: Se ocupa de su ropa independientemente.\nSí: Lava sólo pequeñas cosas.\nNo: Todos se lo tienen que lavar.`}
      />

      <TouchableOpacity style={styles.guardar} onPress={guardarEvaluacion}>
        <Text style={styles.textoGuardar}>Guardar Evaluación</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.regresar}
        onPress={() => setScreen("FuncionamientoMenu")}
      >
        <Text style={styles.textoRegresar}>Regresar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#0D47A1",
    textAlign: "center",
  },
  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  parrafo: {
    fontSize: 16,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  opciones: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  boton: {
    padding: 12,
    borderRadius: 10,
    width: 110,
    alignItems: "center",
    backgroundColor: "#afafaf",
  },
  botonSi: {
    backgroundColor: "#2E7D32",
  },
  botonNo: {
    backgroundColor: "#C62828",
  },
  textoBoton: {
    color: "white",
    fontWeight: "bold",
  },
  separador: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 15,
  },
  guardar: {
    backgroundColor: "#1565C0",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  textoGuardar: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  regresar: {
    marginTop: 15,
    padding: 12,
    alignItems: "center",
  },
  textoRegresar: {
    color: "#0D47A1",
    fontWeight: "bold",
  },
});