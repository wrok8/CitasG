import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert
} from "react-native";

export default function CustomDrawer({
  setScreen,
  currentScreen,
  closeDrawer
}) {

  const DrawerItem = ({ title, icon }) => {

    const active = currentScreen === title;

    return (

      <TouchableOpacity
        style={[
          styles.item,
          active && styles.activeItem
        ]}
        onPress={() => {
          setScreen(title);
          closeDrawer();
        }}
      >

        <Text style={styles.icon}>
          {icon}
        </Text>

        <Text style={styles.text}>
          {title}
        </Text>

      </TouchableOpacity>

    );
  };

  const LogoutItem = () => (

    <TouchableOpacity
      style={styles.logoutItem}
      onPress={() => {

        Alert.alert(
          "Cerrar sesión",
          "¿Seguro que desea cerrar sesión?",
          [
            {
              text: "Cancelar",
              style: "cancel"
            },
            {
              text: "Cerrar sesión",
              style: "destructive",
              onPress: () => {
                Alert.alert("Sesión cerrada correctamente");
                closeDrawer();
              }
            }
          ]
        );

      }}
    >

      <Text style={styles.icon}>
        🚪
      </Text>

      <Text style={styles.text}>
        Cerrar sesión
      </Text>

    </TouchableOpacity>

  );

  return (

    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <Image
          source={{ uri: "https://i.pravatar.cc/150" }}
          style={styles.avatar}
        />

        <Text style={styles.username}>
          Usuario
        </Text>

      </View>


      {/* OPCIONES */}
      <DrawerItem title="Inicio" icon="🏠" />
      <DrawerItem title="Detalles" icon="📋" />
      <DrawerItem title="Perfil" icon="👤" />
      <DrawerItem title="Configuración" icon="⚙️" />


      {/* SEPARADOR */}
      <View style={styles.separator} />


      {/* SALIR */}
      <LogoutItem />


    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0D47A1",
  },

  header: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#1565C0",
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "white"
  },

  username: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },

  activeItem: {
    backgroundColor: "#1976D2",
  },

  icon: {
    fontSize: 20,
    marginRight: 15,
    color: "white",
  },

  text: {
    color: "white",
    fontSize: 18,
  },

  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: 10,
    marginHorizontal: 15
  },

  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#0D47A1",
  },

});