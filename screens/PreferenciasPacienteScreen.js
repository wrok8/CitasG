import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Switch,
  TouchableOpacity,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PreferenciasPacienteScreen() {

  const [nombre, setNombre] = useState("");
  const [tamanoTexto, setTamanoTexto] = useState("Mediano");
  const [modoOscuro, setModoOscuro] = useState(false);
  const [recordatorios, setRecordatorios] = useState(false);

  const [preferenciasGuardadas, setPreferenciasGuardadas] = useState(null);

  const STORAGE_KEY = "@preferencias_paciente_geriatrico";

  useEffect(() => {
    obtenerPreferencias();
  }, []);

  const limpiarCampos = () => {
    setNombre("");
    setTamanoTexto("Mediano");
    setModoOscuro(false);
    setRecordatorios(false);
  };

  const guardarPreferencias = async () => {

    if (!nombre.trim()) {
      Alert.alert("Campo requerido", "Debes capturar el nombre del paciente.");
      return;
    }

    const preferencias = {
      nombre,
      tamanoTexto,
      modoOscuro,
      recordatorios,
    };

    try {

      const preferenciasJSON = JSON.stringify(preferencias);

      await AsyncStorage.setItem(STORAGE_KEY, preferenciasJSON);

      setPreferenciasGuardadas(preferencias);

      limpiarCampos();

      Alert.alert("Éxito", "Preferencias guardadas correctamente.");

    } catch (error) {

      Alert.alert("Error", "No fue posible guardar las preferencias.");

    }
  };

  const obtenerPreferencias = async () => {

    try {

      const preferenciasJSON = await AsyncStorage.getItem(STORAGE_KEY);

      if (preferenciasJSON !== null) {

        const preferencias = JSON.parse(preferenciasJSON);

        setPreferenciasGuardadas(preferencias);

        setNombre(preferencias.nombre);
        setTamanoTexto(preferencias.tamanoTexto);
        setModoOscuro(preferencias.modoOscuro);
        setRecordatorios(preferencias.recordatorios);

      }

    } catch (error) {

      Alert.alert("Error", "No fue posible recuperar las preferencias.");

    }
  };

  const actualizarPreferencias = async () => {

    try {

      const existe = await AsyncStorage.getItem(STORAGE_KEY);

      if (existe === null) {
        Alert.alert("Sin datos", "No hay preferencias guardadas.");
        return;
      }

      const preferenciasActualizadas = {
        nombre,
        tamanoTexto,
        modoOscuro,
        recordatorios,
      };

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(preferenciasActualizadas)
      );

      setPreferenciasGuardadas(preferenciasActualizadas);

      limpiarCampos();

      Alert.alert("Preferencias actualizadas");

    } catch (error) {

      Alert.alert("Error al actualizar");

    }
  };

  const eliminarPreferencias = async () => {

    try {

      await AsyncStorage.removeItem(STORAGE_KEY);

      setPreferenciasGuardadas(null);

      limpiarCampos();

      Alert.alert("Preferencias eliminadas");

    } catch (error) {

      Alert.alert("Error al eliminar");

    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.titulo}>Preferencias del Paciente</Text>

      <Text style={styles.label}>Nombre del paciente</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.label}>Tamaño de texto</Text>

      <View style={styles.opciones}>

        <TouchableOpacity
          style={styles.opcion}
          onPress={() => setTamanoTexto("Pequeño")}
        >
          <Text>Pequeño</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.opcion}
          onPress={() => setTamanoTexto("Mediano")}
        >
          <Text>Mediano</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.opcion}
          onPress={() => setTamanoTexto("Grande")}
        >
          <Text>Grande</Text>
        </TouchableOpacity>

      </View>

      <Text style={styles.seleccion}>
        Seleccionado: {tamanoTexto}
      </Text>

      <View style={styles.switchContainer}>
        <Text>Modo oscuro</Text>
        <Switch value={modoOscuro} onValueChange={setModoOscuro} />
      </View>

      <View style={styles.switchContainer}>
        <Text>Activar recordatorios</Text>
        <Switch value={recordatorios} onValueChange={setRecordatorios} />
      </View>

      <View style={styles.boton}>
        <Button title="Guardar preferencias" onPress={guardarPreferencias} />
      </View>

      <View style={styles.boton}>
        <Button title="Obtener preferencias" onPress={obtenerPreferencias} />
      </View>

      <View style={styles.boton}>
        <Button title="Actualizar preferencias" onPress={actualizarPreferencias} />
      </View>

      <View style={styles.boton}>
        <Button title="Eliminar preferencias" onPress={eliminarPreferencias} />
      </View>

      <View style={styles.resultado}>

        <Text style={styles.subtitulo}>Preferencias almacenadas</Text>

        {preferenciasGuardadas ? (
          <>
            <Text style={styles.texto}>
              Nombre: {preferenciasGuardadas.nombre}
            </Text>

            <Text style={styles.texto}>
              Tamaño de texto: {preferenciasGuardadas.tamanoTexto}
            </Text>

            <Text style={styles.texto}>
              Modo oscuro: {preferenciasGuardadas.modoOscuro ? "Sí" : "No"}
            </Text>

            <Text style={styles.texto}>
              Recordatorios: {preferenciasGuardadas.recordatorios ? "Sí" : "No"}
            </Text>
          </>
        ) : (
          <Text style={styles.texto}>
            No hay preferencias guardadas
          </Text>
        )}

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 10,
  },

  opciones: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  opcion: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 10,
    minWidth: 90,
    alignItems: "center",
  },

  seleccion: {
    marginTop: 10,
  },

  switchContainer: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  boton: {
    marginTop: 12,
  },

  resultado: {
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
  },

  subtitulo: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  texto: {
    fontSize: 16,
  },

});