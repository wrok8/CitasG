import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

export default function HomeScreen({ setScreen }) {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        🏠 Inicio
      </Text>

      <Button
        title="Ir a Detalles"
        onPress={() => setScreen("Detalles")}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

});