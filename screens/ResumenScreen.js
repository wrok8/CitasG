import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Button,
  Alert,
} from "react-native";

const ResumenScreen = ({
  paciente,
  setScreen,
  pacientes,
  setPacientes,
}) => {
  if (!paciente) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>No hay paciente seleccionado</Text>
        <Button
          title="Volver"
          onPress={() => setScreen("Lista de Pacientes")}
        />
      </View>
    );
  }

  const pruebas = Array.isArray(paciente.pruebas)
    ? paciente.pruebas
    : [];

  const puntajeTotal = pruebas.reduce(
    (total, ev) => total + (ev.puntaje || 0),
    0
  );

  // 🔥 AQUÍ SE GUARDA REALMENTE EN LA LISTA
  const guardarPaciente = () => {
    setPacientes((prev) => {
      const existe = prev.find(
        (p) =>
          p.nombre === paciente.nombre &&
          p.telefono === paciente.telefono &&
          p.fecha === paciente.fecha
      );

      if (existe) {
        // Actualiza si ya existe
        return prev.map((p) =>
          p.nombre === paciente.nombre &&
          p.telefono === paciente.telefono &&
          p.fecha === paciente.fecha
            ? paciente
            : p
        );
      } else {
        // Agrega nuevo
        return [...prev, paciente];
      }
    });

    Alert.alert("Éxito", "Paciente guardado correctamente");
    setScreen("Lista de Pacientes");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Resumen Clínico</Text>

      <View style={styles.cardPaciente}>
        <Text style={styles.nombre}>{paciente.nombre}</Text>
        <Text>Teléfono: {paciente.telefono}</Text>
        <Text>
          Fecha: {new Date(paciente.fecha).toLocaleDateString()}
        </Text>
      </View>

      {pruebas.length === 0 ? (
        <Text style={styles.vacio}>
          No hay pruebas registradas
        </Text>
      ) : (
        <>
          <Text style={styles.subtitulo}>Pruebas realizadas</Text>

          {pruebas.map((item, index) => (
            <View key={index} style={styles.cardEvaluacion}>
              <Text style={styles.tipo}>{item.tipo}</Text>
              <Text>Fecha: {item.fecha}</Text>
              <Text>Puntaje: {item.puntaje}</Text>

              {Array.isArray(item.detalle) &&
                item.detalle.length > 0 && (
                  <View style={styles.detalleBox}>
                    <Text style={styles.detalleTitulo}>
                      Detalle:
                    </Text>
                    {item.detalle.map((d, i) => (
                      <Text key={i} style={styles.detalleItem}>
                        • {d}
                      </Text>
                    ))}
                  </View>
                )}
            </View>
          ))}

          <View style={styles.totalBox}>
            <Text style={styles.totalTexto}>
              Puntaje Total
            </Text>
            <Text style={styles.totalNumero}>
              {puntajeTotal}
            </Text>
          </View>
        </>
      )}

      <View style={{ marginVertical: 20 }}>
        <Button
          title="Guardar Paciente"
          onPress={guardarPaciente}
        />

        <View style={{ height: 10 }} />

        <Button
          title="Volver sin guardar"
          onPress={() => setScreen("Lista de Pacientes")}
        />
      </View>
    </ScrollView>
  );
};

export default ResumenScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f6f8",
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  cardPaciente: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  nombre: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  cardEvaluacion: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  tipo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  detalleBox: {
    marginTop: 10,
    backgroundColor: "#eef2f5",
    padding: 10,
    borderRadius: 8,
  },
  detalleTitulo: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  detalleItem: {
    fontSize: 14,
  },
  totalBox: {
    backgroundColor: "#1565C0",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  totalTexto: {
    color: "white",
    fontSize: 16,
  },
  totalNumero: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
  },
  vacio: {
    textAlign: "center",
    marginVertical: 40,
    color: "#7f8c8d",
  },
});