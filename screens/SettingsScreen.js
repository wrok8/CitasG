import React, { useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

export default function SettingsScreen() {
  const [notificaciones, setNotificaciones] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [recordatorios, setRecordatorios] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración</Text>

      <View style={styles.option}>
        <Text style={styles.text}>Notificaciones</Text>
        <Switch
          value={notificaciones}
          onValueChange={setNotificaciones}
          trackColor={{ true: "#1565C0" }}
        />
      </View>

      <View style={styles.option}>
        <Text style={styles.text}>Modo Oscuro</Text>
        <Switch
          value={modoOscuro}
          onValueChange={setModoOscuro}
          trackColor={{ true: "#1565C0" }}
        />
      </View>

      <View style={styles.option}>
        <Text style={styles.text}>Recordatorios automáticos</Text>
        <Switch
          value={recordatorios}
          onValueChange={setRecordatorios}
          trackColor={{ true: "#1565C0" }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#0D47A1",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  text: {
    fontSize: 16,
  },
});