import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const FormSection = ({
  title,
  subtitle,
  children,
}) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? (
      <Text style={styles.subtitle}>{subtitle}</Text>
    ) : null}
    <View style={styles.content}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
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