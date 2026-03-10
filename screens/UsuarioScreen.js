import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UsuarioScreen() {

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [usuarioGuardado, setUsuarioGuardado] = useState(null);

  const STORAGE_KEY = "@perfil_usuario";

  useEffect(() => {
    obtenerUsuario();
  }, []);

  const limpiarCampos = () => {
    setNombre("");
    setCorreo("");
  };

  const guardarUsuario = async () => {

    if (!nombre.trim() || !correo.trim()) {
      Alert.alert("Campos incompletos", "Debes capturar nombre y correo.");
      return;
    }

    const usuario = {
      nombre,
      correo,
    };

    try {

      const usuarioJSON = JSON.stringify(usuario);

      await AsyncStorage.setItem(STORAGE_KEY, usuarioJSON);

      setUsuarioGuardado(usuario);

      limpiarCampos();

      Alert.alert("Éxito", "Usuario guardado correctamente.");

    } catch (error) {

      Alert.alert("Error", "No fue posible guardar la información.");
      console.log(error);

    }
  };

  const obtenerUsuario = async () => {

    try {

      const usuarioJSON = await AsyncStorage.getItem(STORAGE_KEY);

      if (usuarioJSON !== null) {

        const usuario = JSON.parse(usuarioJSON);

        setUsuarioGuardado(usuario);

        setNombre(usuario.nombre);
        setCorreo(usuario.correo);

      }

    } catch (error) {

      Alert.alert("Error", "No fue posible recuperar la información.");

    }
  };

  const actualizarUsuario = async () => {

    try {

      const usuarioExiste = await AsyncStorage.getItem(STORAGE_KEY);

      if (usuarioExiste === null) {
        Alert.alert("Sin registro previo", "No hay usuario guardado.");
        return;
      }

      const usuarioActualizado = {
        nombre,
        correo,
      };

      const usuarioJSON = JSON.stringify(usuarioActualizado);

      await AsyncStorage.setItem(STORAGE_KEY, usuarioJSON);

      setUsuarioGuardado(usuarioActualizado);

      limpiarCampos();

      Alert.alert("Usuario actualizado correctamente");

    } catch (error) {

      Alert.alert("Error", "No fue posible actualizar la información.");

    }
  };

  const eliminarUsuario = async () => {

    try {

      await AsyncStorage.removeItem(STORAGE_KEY);

      setUsuarioGuardado(null);

      limpiarCampos();

      Alert.alert("Usuario eliminado");

    } catch (error) {

      Alert.alert("Error al eliminar");

    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.titulo}>Registro de Usuario</Text>

      <Text style={styles.label}>Nombre</Text>

      <TextInput
        style={styles.input}
        placeholder="Escribe tu nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.label}>Correo</Text>

      <TextInput
        style={styles.input}
        placeholder="Escribe tu correo"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
      />

      <View style={styles.boton}>
        <Button title="Guardar usuario" onPress={guardarUsuario} />
      </View>

      <View style={styles.boton}>
        <Button title="Obtener usuario" onPress={obtenerUsuario} />
      </View>

      <View style={styles.boton}>
        <Button title="Actualizar usuario" onPress={actualizarUsuario} />
      </View>

      <View style={styles.boton}>
        <Button title="Eliminar usuario" onPress={eliminarUsuario} />
      </View>

      <View style={styles.resultado}>

        <Text style={styles.subtitulo}>Usuario almacenado</Text>

        {usuarioGuardado ? (
          <>
            <Text style={styles.texto}>
              Nombre: {usuarioGuardado.nombre}
            </Text>

            <Text style={styles.texto}>
              Correo: {usuarioGuardado.correo}
            </Text>
          </>
        ) : (
          <Text style={styles.texto}>No hay datos guardados</Text>
        )}

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#ffffff",
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
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 10,
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
    marginBottom: 5,
  },

});