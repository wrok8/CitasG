import React from "react";
import { update, ref } from "firebase/database";
import { db } from "../firebaseConfig";

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
        <Text style={styles.titulo}>
          No hay paciente seleccionado
        </Text>
        <Button
          title="Volver"
          onPress={() =>
            setScreen("Lista de Pacientes")
          }
        />
      </View>
    );
  }

  const pruebas = Array.isArray(
    paciente.pruebas
  )
    ? paciente.pruebas
    : [];

  const puntajeTotal = pruebas.reduce(
    (total, ev) =>
      total + (ev.puntaje || 0),
    0
  );

  const cambiarEstado = async (
    nuevoEstado
  ) => {
    try {
      if (!paciente?.id) {
        Alert.alert(
          "Error",
          "No se encontró el ID de la cita"
        );
        return;
      }

      await update(
        ref(db, `citas/${paciente.id}`),
        {
          status: nuevoEstado,
        }
      );

      paciente.status = nuevoEstado;

      Alert.alert(
        "Estado actualizado",
        `La cita ahora está: ${nuevoEstado}`
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo actualizar el estado"
      );
      console.log(error);
    }
  };

  const guardarPaciente = () => {
    setPacientes((prev) => {
      const existe = prev.find(
        (p) =>
          p.nombre === paciente.nombre &&
          p.telefono ===
            paciente.telefono &&
          p.fecha === paciente.fecha
      );

      if (existe) {
        return prev.map((p) =>
          p.nombre === paciente.nombre &&
          p.telefono ===
            paciente.telefono &&
          p.fecha === paciente.fecha
            ? paciente
            : p
        );
      } else {
        return [...prev, paciente];
      }
    });

    Alert.alert(
      "Éxito",
      "Paciente guardado correctamente"
    );

    setScreen("Lista de Pacientes");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>
        Resumen Clínico
      </Text>

      {/* DATOS PACIENTE */}
      <View style={styles.cardPaciente}>
        <Text style={styles.nombre}>
          {paciente.nombre}
        </Text>

        <Text>
          Teléfono:{" "}
          {paciente.telefono}
        </Text>

        <Text>
          Fecha:{" "}
          {paciente.fecha
            ? new Date(
                paciente.fecha
              ).toLocaleDateString()
            : ""}
        </Text>

        <Text>
          Estado actual:{" "}
          {paciente.status ||
            "Agenda"}
        </Text>
      </View>

      {pruebas.length === 0 ? (
        <Text style={styles.vacio}>
          No hay pruebas registradas
        </Text>
      ) : (
        <>
          <Text
            style={styles.subtitulo}
          >
            Pruebas realizadas
          </Text>

          {pruebas.map(
            (item, index) => (
              <View
                key={index}
                style={
                  styles.cardEvaluacion
                }
              >
                <Text
                  style={styles.tipo}
                >
                  {item.tipo}
                </Text>

                <Text>
                  Fecha: {item.fecha}
                </Text>

                {item.puntaje !==
                  undefined && (
                  <Text>
                    Puntaje:{" "}
                    {item.puntaje}
                  </Text>
                )}

                {item.tipo ===
                  "OARS" && (
                  <View
                    style={
                      styles.detalleBox
                    }
                  >
                    <Text
                      style={
                        styles.detalleTitulo
                      }
                    >
                      Respuestas del
                      Formulario:
                    </Text>

                    {item.detalle
                      ?.respuestas ? (
                      Object.entries(
                        item.detalle
                          .respuestas
                      ).map(
                        (
                          [
                            key,
                            value,
                          ],
                          i
                        ) => (
                          <Text
                            key={i}
                            style={
                              styles.detalleItem
                            }
                          >
                            • {key}:{" "}
                            {Array.isArray(
                              value
                            )
                              ? value.join(
                                  ", "
                                )
                              : String(
                                  value ||
                                    "No especificado"
                                )}
                          </Text>
                        )
                      )
                    ) : (
                      <Text
                        style={
                          styles.detalleItem
                        }
                      >
                        No se
                        encontraron
                        respuestas
                      </Text>
                    )}
                  </View>
                )}

                {Array.isArray(
                  item.detalle
                ) &&
                  item.detalle
                    .length > 0 && (
                    <View
                      style={
                        styles.detalleBox
                      }
                    >
                      <Text
                        style={
                          styles.detalleTitulo
                        }
                      >
                        Detalle:
                      </Text>

                      {item.detalle.map(
                        (
                          d,
                          i
                        ) => (
                          <Text
                            key={i}
                            style={
                              styles.detalleItem
                            }
                          >
                            • {d}
                          </Text>
                        )
                      )}
                    </View>
                  )}
              </View>
            )
          )}

          {puntajeTotal > 0 && (
            <View
              style={styles.totalBox}
            >
              <Text
                style={
                  styles.totalTexto
                }
              >
                Puntaje Total
              </Text>

              <Text
                style={
                  styles.totalNumero
                }
              >
                {puntajeTotal}
              </Text>
            </View>
          )}
        </>
      )}

      <View
        style={{ marginVertical: 20 }}
      >
        <Button
          title="Guardar Paciente"
          onPress={guardarPaciente}
        />

        <View
          style={{ height: 10 }}
        />

        <Button
          title="Volver sin guardar"
          onPress={() =>
            setScreen(
              "Lista de Pacientes"
            )
          }
        />
      </View>

      <Button
        title="Agenda"
        onPress={() =>
          cambiarEstado("Agenda")
        }
      />

      <View style={{ height: 10 }} />

      <Button
        title="En curso"
        onPress={() =>
          cambiarEstado("En curso")
        }
      />

      <View style={{ height: 10 }} />

      <Button
        title="Concluir"
        onPress={() =>
          cambiarEstado(
            "Concluida"
          )
        }
      />
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
