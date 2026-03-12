import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UsuarioScreen({ setScreen }) {

  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");

  const [usuarios, setUsuarios] = useState([]);

  const STORAGE_KEY = "@usuarios_app";
  const USER_SELECTED = "@usuario_seleccionado";

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const limpiarCampos = () => {
    setNombre("");
    setContacto("");
    setCorreo("");
    setTelefono("");
  };

  const guardarUsuario = async () => {

    if (!nombre || !correo || !telefono) {
      Alert.alert("Error", "Completa los campos obligatorios");
      return;
    }

    const nuevoUsuario = {
      id: Date.now(),
      nombre,
      contacto,
      correo,
      telefono,
    };

    const nuevosUsuarios = [...usuarios, nuevoUsuario];

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosUsuarios));

    setUsuarios(nuevosUsuarios);

    limpiarCampos();

    Alert.alert("Usuario guardado");
  };

  const obtenerUsuarios = async () => {

    const data = await AsyncStorage.getItem(STORAGE_KEY);

    if (data) {
      setUsuarios(JSON.parse(data));
    }

  };

  const escogerUsuario = async (usuario) => {

    await AsyncStorage.setItem(
      USER_SELECTED,
      JSON.stringify(usuario)
    );

    Alert.alert("Usuario seleccionado", usuario.nombre);

    if (setScreen) {
      setScreen("RegisterPatient"); 
    }

  };

  const eliminarUsuario = async (id) => {

    const nuevosUsuarios = usuarios.filter((u) => u.id !== id);

    setUsuarios(nuevosUsuarios);

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nuevosUsuarios)
    );

    Alert.alert("Usuario eliminado");
  };

  const eliminarTodos = async () => {

    await AsyncStorage.removeItem(STORAGE_KEY);

    setUsuarios([]);

    Alert.alert("Todos los usuarios eliminados");

  };

  return (

    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.titulo}>Registrar Usuario</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Contacto"
        value={contacto}
        onChangeText={setContacto}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={correo}
        onChangeText={setCorreo}
      />

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />

      <View style={styles.boton}>
        <Button title="Guardar Usuario" onPress={guardarUsuario} />
      </View>

      <View style={styles.boton}>
        <Button title="Eliminar Todos" onPress={eliminarTodos} />
      </View>

      <View style={styles.resultado}>

        <Text style={styles.subtitulo}>Usuarios Guardados</Text>

        {usuarios.map((u) => (

          <View key={u.id} style={styles.card}>

            <Text style={styles.nombre}>{u.nombre}</Text>
            <Text>Contacto: {u.contacto}</Text>
            <Text>Email: {u.correo}</Text>
            <Text>Tel: {u.telefono}</Text>

            <View style={styles.botonesCard}>

              <TouchableOpacity
                style={styles.botonEscoger}
                onPress={() => escogerUsuario(u)}
              >
                <Text style={styles.textoBoton}>Escoger</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botonEliminar}
                onPress={() => eliminarUsuario(u.id)}
              >
                <Text style={styles.textoBoton}>Eliminar</Text>
              </TouchableOpacity>

            </View>

          </View>

        ))}

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container:{
    padding:20
  },

  titulo:{
    fontSize:24,
    fontWeight:"bold",
    marginBottom:20
  },

  input:{
    borderWidth:1,
    borderColor:"#999",
    borderRadius:8,
    padding:10,
    marginTop:10
  },

  boton:{
    marginTop:15
  },

  resultado:{
    marginTop:25
  },

  subtitulo:{
    fontSize:18,
    fontWeight:"bold"
  },

  card:{
    borderWidth:1,
    borderColor:"#ccc",
    padding:12,
    marginTop:10,
    borderRadius:10
  },

  nombre:{
    fontWeight:"bold",
    fontSize:16
  },

  botonesCard:{
    flexDirection:"row",
    marginTop:10,
    gap:10
  },

  botonEscoger:{
    backgroundColor:"#1565C0",
    padding:10,
    borderRadius:6
  },

  botonEliminar:{
    backgroundColor:"#C62828",
    padding:10,
    borderRadius:6
  },

  textoBoton:{
    color:"white",
    fontWeight:"bold"
  }

});