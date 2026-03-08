import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image
} from "react-native";
import * as Location from "expo-location";

export default function WeatherScreen() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_KEY = "8cbf6ceb9e3ef7e144bf6ef4d5618456";

  useEffect(() => {
    getWeather();
  }, []);

  const getWeather = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Permiso de ubicación denegado");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const url =
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=es&appid=${API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      console.log("Weather:", data);

      setWeather(data);
      setLoading(false);
    } catch (error) {
      console.log("Error clima:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1565C0" />
        <Text>Cargando clima...</Text>
      </View>
    );
  }

  const icon = weather.weather[0].icon;

  return (
    <View style={styles.container}>
      <Text style={styles.city}>📍 {weather.name}</Text>

      <Image
        style={styles.icon}
        source={{
          uri: `https://openweathermap.org/img/wn/${icon}@4x.png`,
        }}
      />

      <Text style={styles.temp}>
        🌡 {Math.round(weather.main.temp)}°C
      </Text>

      <Text style={styles.desc}>
        {weather.weather[0].description}
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.info}>
          💧 Humedad: {weather.main.humidity}%
        </Text>

        <Text style={styles.info}>
          🌬 Viento: {(weather.wind.speed * 3.6).toFixed(1)} km/h
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3F2FD",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  city: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0D47A1",
  },

  icon: {
    width: 120,
    height: 120,
  },

  temp: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#1565C0",
  },

  desc: {
    fontSize: 20,
    textTransform: "capitalize",
    marginBottom: 20,
  },

  infoBox: {
    marginTop: 10,
    padding: 20,
    borderRadius: 15,
    backgroundColor: "white",
    elevation: 3,
  },

  info: {
    fontSize: 18,
    marginVertical: 5,
  },
});