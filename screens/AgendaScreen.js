import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { ref, onValue } from "firebase/database";
import { db } from "../firebaseConfig";

export default function AgendaScreen() {
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    const citasRef = ref(db, "citas");

    onValue(citasRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const lista = Object.keys(data).map((key) => ({
          id: key,
          ...data[key]
        }));

        setCitas(lista);
      }
    });
  }, []);

  return (
    <FlatList
      data={citas}
      renderItem={({ item }) => (
        <View>
          <Text>{item.nombre}</Text>
          <Text>{item.medicoNombre}</Text>
          <Text>{item.fecha}</Text>
          <Text>{item.hora}</Text>
          <Text>{item.status}</Text>
        </View>
      )}
    />
  );
}