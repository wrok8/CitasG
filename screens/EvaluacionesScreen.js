import React from "react";
import {
  SectionList,
  Text,
  View,
  StyleSheet,
} from "react-native";

const DATA = [
  {
    title: "Cognitivo",
    data: [
      "Mini-Mental State Examination (MMSE)",
      "Montreal Cognitive Assessment (MoCA)",
      "Test del Reloj",
      "Pfeiffer (SPMSQ)",
    ],
  },
  {
    title: "Afectivo",
    data: [
      "Escala de Depresión Geriátrica (Yesavage)",
      "PHQ-9",
      "GAD-7",
    ],
  },
  {
    title: "Funcionamiento",
    data: [
      "Índice de Barthel",
      "Escala de Katz",
      "Lawton & Brody",
    ],
  },
  {
    title: "Nutricional",
    data: [
      "Mini Nutritional Assessment (MNA)",
      "IMC",
      "Valoración de riesgo de desnutrición",
    ],
  },
  {
    title: "Entorno",
    data: [
      "Escala de Apoyo Social de Duke",
      "Evaluación de riesgo en el hogar",
      "Escala Zarit (sobrecarga del cuidador)",
    ],
  },
];

export default function EvaluacionesScreen() {
  return (
    <View style={{ flex: 1 }}>
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>• {item}</Text>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.header}>
            <Text style={styles.headerText}>{title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#1565C0",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 15,
  },

  headerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  item: {
    backgroundColor: "#E3F2FD",
    padding: 12,
    marginTop: 5,
    borderRadius: 8,
  },

  itemText: {
    fontSize: 14,
    color: "#0D47A1",
  },
});