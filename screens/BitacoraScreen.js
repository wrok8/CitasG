import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";

import { obtenerBitacora } from "../database";

export default function BitacoraScreen() {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    setHistorial(obtenerBitacora());
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        📘 Bitácora
      </Text>

      <FlatList
        data={historial}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>
              📅 {item.fecha}
            </Text>

            <Text>
              🕒 {item.hora}
            </Text>

            <Text>
              👤 {item.usuario}
            </Text>

            <Text>
              📝 {item.movimiento}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#E3F2FD",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
});