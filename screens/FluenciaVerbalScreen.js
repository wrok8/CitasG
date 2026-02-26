import React, { useEffect, useState } from 'react';
import {
  Button,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

const FluenciaVerbalAnimales = () => {
  const TIEMPO_TOTAL = 60;

  const [fase, setFase] = useState('inicio');
  const [segundos, setSegundos] = useState(TIEMPO_TOTAL);
  const [texto, setTexto] = useState('');
  const [animales, setAnimales] = useState([]);
  const [timerActivo, setTimerActivo] = useState(false);
  const [ignorarMayusculas] = useState(true);

  // Temporizador
  useEffect(() => {
    let intervalo = null;

    if (timerActivo && segundos > 0) {
      intervalo = setInterval(() => {
        setSegundos(prev => prev - 1);
      }, 1000);
    }

    // Finaliza automáticamente cuando llega a 0
    if (segundos === 0 && timerActivo) {
      finalizarPrueba();
    }

    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [timerActivo, segundos]);

  const iniciarPrueba = () => {
    setFase('instrucciones');
    setSegundos(TIEMPO_TOTAL);
    setTexto('');
    setAnimales([]);
    setTimerActivo(false);
  };

  const comenzarPrueba = () => {
    setFase('prueba');
    setSegundos(TIEMPO_TOTAL);
    setTexto('');
    setAnimales([]);
    setTimerActivo(true);
  };

  const finalizarPrueba = () => {
    setTimerActivo(false);

    let palabras = texto
      .split('\n')
      .map(w => w.trim())
      .filter(w => w.length > 1);

    // Eliminar duplicados
    if (ignorarMayusculas) {
      const mapa = new Map();
      palabras.forEach(w => {
        const clave = w.toLowerCase();
        if (!mapa.has(clave)) mapa.set(clave, w);
      });
      palabras = Array.from(mapa.values());
    } else {
      palabras = [...new Set(palabras)];
    }

    setAnimales(palabras);
    setFase('resultados');
  };

  const reiniciar = () => {
    setTimerActivo(false);
    setFase('inicio');
    setTexto('');
    setAnimales([]);
    setSegundos(TIEMPO_TOTAL);
  };

  // ================= INICIO =================
  if (fase === 'inicio') {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Fluidez Verbal - Animales</Text>

        <View style={styles.botonContenedor}>
          <Button title="Comenzar prueba" onPress={iniciarPrueba} />
        </View>
      </View>
    );
  }

  // ================= INSTRUCCIONES =================
  if (fase === 'instrucciones') {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.titulo}>Instrucciones</Text>

        <Text style={styles.textoInstruccion}>
          Quiero que nombre palabras que pertenecen a la categoría "animales".
        </Text>

        <Text style={styles.textoInstruccion}>
          Piense en cualquier animal que viva en el aire, en el agua, en el bosque...
        </Text>

        <Text style={styles.textoInstruccion}>
          Tiene un minuto para hacerlo.
        </Text>

        <Text style={styles.nota}>
          Se permiten: animales extintos, imaginarios o mágicos.{"\n"}
          NO se cuentan: repeticiones ni variaciones.
        </Text>

        <View style={styles.botonContenedor}>
          <Button
            title="Entendido → Iniciar"
            onPress={comenzarPrueba}
          />
        </View>
      </ScrollView>
    );
  }

  // ================= PRUEBA =================
  if (fase === 'prueba') {
    return (
      <View style={styles.container}>
        <Text style={styles.temporizador}>
          {Math.floor(segundos / 60).toString().padStart(2, '0')}:
          {(segundos % 60).toString().padStart(2, '0')}
        </Text>

        <Text style={styles.leyendaTemporizador}>Tiempo restante</Text>

        <Text style={styles.instruccionActiva}>
          ¡Escriba todos los animales que pueda!
        </Text>

        <TextInput
          style={styles.inputMultilinea}
          multiline
          numberOfLines={10}
          placeholder="Un animal por línea..."
          value={texto}
          onChangeText={setTexto}
          autoFocus
          textAlignVertical="top"
        />

        <View style={styles.botonContenedor}>
          <Button title="Terminar ahora" onPress={finalizarPrueba} />
        </View>
      </View>
    );
  }

  // ================= RESULTADOS =================
  if (fase === 'resultados') {
    const secciones = [
      {
        title: 'Animales válidos',
        data: animales,
      },
    ];

    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Resultados</Text>

        <View style={styles.cajaResultado}>
          <Text style={styles.total}>
            {animales.length} animales válidos
          </Text>
          <Text style={styles.subtotal}>
            (en 60 segundos, sin repeticiones)
          </Text>
        </View>

        {animales.length === 0 ? (
          <Text style={styles.textoVacio}>
            No se registraron animales válidos
          </Text>
        ) : (
          <SectionList
            sections={secciones}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={styles.item}>• {item}</Text>
            )}
            renderSectionHeader={({ section }) => (
              <Text style={styles.headerSeccion}>{section.title}</Text>
            )}
            style={styles.lista}
          />
        )}

        <View style={styles.botonContenedor}>
          <Button title="Nueva prueba" onPress={reiniciar} />
        </View>

        <Text style={styles.notaFinal}>
          Consultar tablas normativas según edad y escolaridad.
        </Text>
      </View>
    );
  }

  return null;
};

export default FluenciaVerbalAnimales;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fbfc',
    padding: 20,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#2c3e50',
  },
  textoInstruccion: {
    fontSize: 17,
    lineHeight: 26,
    marginVertical: 8,
    color: '#34495e',
  },
  nota: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#7f8c8d',
    marginVertical: 16,
    padding: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
  },
  botonContenedor: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  temporizador: {
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#c0392b',
    marginTop: 30,
  },
  leyendaTemporizador: {
    fontSize: 16,
    textAlign: 'center',
    color: '#95a5a6',
    marginBottom: 20,
  },
  instruccionActiva: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#27ae60',
    marginBottom: 16,
  },
  inputMultilinea: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 17,
    minHeight: 160,
    marginBottom: 16,
  },
  cajaResultado: {
    backgroundColor: '#ecf0f1',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  total: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtotal: {
    fontSize: 15,
    color: '#7f8c8d',
    marginTop: 6,
  },
  lista: {
    marginVertical: 10,
  },
  headerSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#bdc3c7',
    padding: 8,
    color: 'white',
  },
  item: {
    fontSize: 17,
    paddingVertical: 6,
    paddingHorizontal: 12,
    color: '#2c3e50',
  },
  textoVacio: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginVertical: 40,
  },
  notaFinal: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 20,
  },
});