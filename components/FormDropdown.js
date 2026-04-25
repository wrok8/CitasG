import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export default function FormDropdown({
  label,
  data,
  placeholder,
  value,
  onChange,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        data={data}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onChange={(item) =>
          onChange(item.value)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  dropdown: {
    height: 40,
    backgroundColor: "#F1F3F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  placeholderStyle: {
    fontSize: 14,
    color: "#999",
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#333",
  },
});