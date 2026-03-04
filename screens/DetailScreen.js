import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { Video } from "expo-av";

export default function DetailScreen({ setScreen }) {
  const [showContent, setShowContent] = useState(false);
  const videoRef = useRef(null);

  const handlePlaybackFinish = () => {
    setShowContent(true);
  };

  if (!showContent) {
    return (
      <View style={styles.splashContainer}>
        <Video
          ref={videoRef}
          source={require("../assets/IntroPrado.mp4")}
          style={styles.video}
          resizeMode="cover"
          shouldPlay
          isLooping={false}
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              handlePlaybackFinish();
            }
          }}
        />
      </View>
    );
  }

  // 👇 Cuando termina el video, muestra Detalles
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
  splashContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
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