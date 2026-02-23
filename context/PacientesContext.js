import React, { createContext, useState } from "react";

export const PacientesContext = createContext();

export const PacientesProvider = ({ children }) => {
  const [pacientes, setPacientes] = useState([]);

  const agregarPaciente = (paciente) => {
    setPacientes([...pacientes, paciente]);
  };

  return (
    <PacientesContext.Provider value={{ pacientes, agregarPaciente }}>
      {children}
    </PacientesContext.Provider>
  );
};