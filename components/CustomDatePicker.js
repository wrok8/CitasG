import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  View,
} from "react-native";

export default function CustomDatePicker({
  label,
  value,
  onChange,
}) {
  const [show, setShow] = useState(false);

  const onDateChange = (
    event,
    selectedDate
  ) => {
    setShow(
      Platform.OS === "ios"
    );

    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString(
      "es-ES",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TouchableOpacity
        style={styles.pickerTrigger}
        onPress={() =>
          setShow(true)
        }
      >
        <Text style={styles.icon}>
          📅
        </Text>

        <Text style={styles.dateText}>
          {formatDate(value)}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display={
            Platform.OS === "ios"
              ? "spinner"
              : "default"
          }
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  pickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  icon: {
    marginRight: 10,
    fontSize: 16,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
});