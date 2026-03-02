import React, { createContext, useState } from 'react';

export const EvaluationContext = createContext();

export const EvaluationProvider = ({ children }) => {
  const [resultados, setResultados] = useState([]);

  const agregarResultado = (nuevoResultado) => {
    setResultados(prev => [...prev, nuevoResultado]);
  };

  const limpiarResultados = () => {
    setResultados([]);
  };

  return (
    <EvaluationContext.Provider
      value={{
        resultados,
        agregarResultado,
        limpiarResultados
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
};