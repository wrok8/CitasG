import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

export function FormSection({
  title,
  subtitle,
  children,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {title}
      </Text>

      <Text
        style={styles.subtitle}
      >
        {subtitle}
      </Text>

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor: "#FFF",
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      elevation: 2,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#002B5E",
    },
    subtitle: {
      fontSize: 13,
      color: "#888",
      marginBottom: 15,
    },
    content: {
      gap: 10,
    },
  });