import React, { useState, useEffect } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function FormField({
  label,
  error,
  style,
  tamanoTextoPrevio = "Mediano",
  ...props
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await AsyncStorage.getItem(
          "@preferencias_paciente_geriatrico"
        );

        if (res) {
          setModoOscuro(
            JSON.parse(res).modoOscuro || false
          );
        }
      } catch (e) {
        console.warn(
          "AsyncStorage no disponible:",
          e
        );
      }
    };

    load();
  }, []);

  const getDynamicFontSize = (
    baseSize
  ) => {
    if (
      tamanoTextoPrevio === "Pequeño"
    )
      return baseSize - 4;

    if (
      tamanoTextoPrevio === "Grande"
    )
      return baseSize + 6;

    return baseSize;
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          {
            fontSize:
              getDynamicFontSize(14),
            color: modoOscuro
              ? "#fff"
              : "#1A1A1A",
          },
        ]}
      >
        {label}
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            fontSize:
              getDynamicFontSize(
                isMobile ? 14 : 15
              ),
            backgroundColor:
              modoOscuro
                ? "#333"
                : "#F1F3F5",
            color: modoOscuro
              ? "#fff"
              : "#000",
          },
          error &&
            styles.inputError,
          style,
        ]}
        placeholderTextColor={
          modoOscuro ? "#aaa" : "#999"
        }
        {...(Platform.OS ===
        "android"
          ? {
              includeFontPadding: false,
            }
          : {})}
        {...props}
      />

      {error && (
        <Text
          style={styles.errorText}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      marginBottom: 15,
      flex: 1,
    },
    label: {
      fontWeight: "600",
      marginBottom: 8,
    },
    input: {
      height: 40,
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: "#E9ECEF",
    },
    inputError: {
      borderColor: "#FF4D4D",
    },
    errorText: {
      color: "#FF4D4D",
      fontSize: 11,
      marginTop: 5,
    },
  });