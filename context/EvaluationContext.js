import React, { createContext, useState } from "react";

export const EvaluationContext = createContext();

export const EvaluationProvider = ({ children }) => {


  const [citaEnProgreso, setCitaEnProgreso] = useState({

    nombre:             "",
    contacto:           "",
    email:              "",
    telefono:           "",


    fecha:              new Date(),
    hora:               new Date(),
    medico:             "",
    centroGeriatrico:   "",
    motivo:             "",
    sintomas:           "",


    evaluacionesActivas: {
      Cognitivo:        false,
      Afectivo:         false,
      Funcionamiento:   false,
      Nutricional:      false,
      Entorno:          false,
    },

    evaluacionesResultados: {},
  });

 

  const actualizarDatosCita = (datos) => {
    setCitaEnProgreso((prev) => ({
      ...prev,
      ...datos,
    }));
  };


  const toggleEvaluacion = (categoria, valor) => {
    setCitaEnProgreso((prev) => ({
      ...prev,
      evaluacionesActivas: {
        ...prev.evaluacionesActivas,
        [categoria]: valor,
      },
    }));
  };

  /**
   * 
   * @param {string} nombrePrueba - "OARS", "MoCA", "GDS-15", "Katz", etc.
   * @param {object} resultado - { nombre, puntaje, puntajeMax, interpretacion, fecha, hora, detalles }
   */
  const guardarResultadoPrueba = (nombrePrueba, resultado) => {
    setCitaEnProgreso((prev) => ({
      ...prev,
      evaluacionesResultados: {
        ...prev.evaluacionesResultados,
        [nombrePrueba]: resultado, 
      },
    }));
  };


  const obtenerResultadoPrueba = (nombrePrueba) => {
    return citaEnProgreso.evaluacionesResultados[nombrePrueba] || null;
  };


  const obtenerTodasLasPruebas = () => {
    return Object.entries(citaEnProgreso.evaluacionesResultados).map(
      ([nombre, datos]) => ({ nombre, ...datos })
    );
  };


  const eliminarPrueba = (nombrePrueba) => {
    setCitaEnProgreso((prev) => {
      const nuevoResultados = { ...prev.evaluacionesResultados };
      delete nuevoResultados[nombrePrueba];
      return {
        ...prev,
        evaluacionesResultados: nuevoResultados,
      };
    });
  };


  const limpiarCitaEnProgreso = () => {
    setCitaEnProgreso({
      nombre:             "",
      contacto:           "",
      email:              "",
      telefono:           "",
      fecha:              new Date(),
      hora:               new Date(),
      medico:             "",
      centroGeriatrico:   "",
      motivo:             "",
      sintomas:           "",
      evaluacionesActivas: {
        Cognitivo:        false,
        Afectivo:         false,
        Funcionamiento:   false,
        Nutricional:      false,
        Entorno:          false,
      },
      evaluacionesResultados: {},
    });
  };


  const obtenerCitaCompleta = () => {
    return {
      ...citaEnProgreso,
      fecha:      citaEnProgreso.fecha.toISOString(),
      hora:       citaEnProgreso.hora.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status:     "agendada",
      observaciones: "",
      creadoEn:   new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    };
  };

  const value = {

    citaEnProgreso,
    setCitaEnProgreso,


    actualizarDatosCita,
    toggleEvaluacion,
    guardarResultadoPrueba,        
    obtenerResultadoPrueba,        
    obtenerTodasLasPruebas,        
    eliminarPrueba,                
    limpiarCitaEnProgreso,
    obtenerCitaCompleta,
  };

  return (
    <EvaluationContext.Provider value={value}>
      {children}
    </EvaluationContext.Provider>
  );
};
