import React, { createContext, useState } from "react";

export const EvaluationContext = createContext();

export const EvaluationProvider = ({ children }) => {
  // ── Datos del paciente en cita actual ───────────────────────────────────

  const [citaEnProgreso, setCitaEnProgreso] = useState({
    // Datos básicos
    nombre:             "",
    contacto:           "",
    email:              "",
    telefono:           "",

    // Datos de la cita
    fecha:              new Date(),
    hora:               new Date(),
    medico:             "",
    centroGeriatrico:   "",
    motivo:             "",
    sintomas:           "",

    // Evaluaciones activadas (categorías)
    evaluacionesActivas: {
      Cognitivo:        false,
      Afectivo:         false,
      Funcionamiento:   false,
      Nutricional:      false,
      Entorno:          false,
    },

    // ⭐ RESULTADOS DE EVALUACIONES - CADA PRUEBA POR SEPARADO ⭐
    // Estructura: { "nombrePrueba": { datos }, "nombrePrueba2": { datos } }
    evaluacionesResultados: {},
  });

  // ── Funciones de actualización ─────────────────────────────────────────

  /**
   * Actualizar datos básicos de la cita (paciente, médico, fecha, etc.)
   */
  const actualizarDatosCita = (datos) => {
    setCitaEnProgreso((prev) => ({
      ...prev,
      ...datos,
    }));
  };

  /**
   * Activar/desactivar una categoría de evaluación
   */
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
   * Guardar resultado de una PRUEBA INDIVIDUAL (no por categoría)
   * 
   * @param {string} nombrePrueba - "OARS", "MoCA", "GDS-15", "Katz", etc.
   * @param {object} resultado - { nombre, puntaje, puntajeMax, interpretacion, fecha, hora, detalles }
   * 
   * EJEMPLO:
   *   guardarResultadoPrueba("OARS", { nombre: "OARS", puntaje: 21, puntajeMax: 30, ... })
   *   guardarResultadoPrueba("GDS-15", { nombre: "GDS-15", puntaje: 10, puntajeMax: 15, ... })
   */
  const guardarResultadoPrueba = (nombrePrueba, resultado) => {
    console.log(`📊 Guardando prueba ${nombrePrueba}:`, resultado);
    setCitaEnProgreso((prev) => ({
      ...prev,
      evaluacionesResultados: {
        ...prev.evaluacionesResultados,
        [nombrePrueba]: resultado, // ⭐ Clave: nombre de la prueba, no categoría
      },
    }));
  };

  /**
   * Obtener resultado de una PRUEBA específica
   */
  const obtenerResultadoPrueba = (nombrePrueba) => {
    return citaEnProgreso.evaluacionesResultados[nombrePrueba] || null;
  };

  /**
   * Obtener todas las pruebas realizadas como array
   */
  const obtenerTodasLasPruebas = () => {
    return Object.entries(citaEnProgreso.evaluacionesResultados).map(
      ([nombre, datos]) => ({ nombre, ...datos })
    );
  };

  /**
   * Eliminar una prueba específica
   */
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

  /**
   * Limpiar toda la cita en progreso (después de agendar o cancelar)
   */
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

  /**
   * Obtener objeto completo para guardar en Firebase
   */
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

  // ── Provider value ─────────────────────────────────────────────────────

  const value = {
    // Estado
    citaEnProgreso,
    setCitaEnProgreso,

    // Métodos
    actualizarDatosCita,
    toggleEvaluacion,
    guardarResultadoPrueba,        // ⭐ CAMBIO: por prueba individual
    obtenerResultadoPrueba,        // ⭐ CAMBIO: obtener prueba individual
    obtenerTodasLasPruebas,        // ⭐ NUEVO: obtener todas las pruebas
    eliminarPrueba,                // ⭐ NUEVO: eliminar una prueba
    limpiarCitaEnProgreso,
    obtenerCitaCompleta,
  };

  return (
    <EvaluationContext.Provider value={value}>
      {children}
    </EvaluationContext.Provider>
  );
};
