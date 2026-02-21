import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

export default function DetailScreen({ setScreen }) {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        📋 Detalles
      </Text>

      <Button
        title="Volver a Inicio"
        onPress={() => setScreen("Inicio")}
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