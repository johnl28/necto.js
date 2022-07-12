import NectoContext from "./NectoContext";

const createNectoContext = (element, options) => {
  return new NectoContext(element, options);
}

export default createNectoContext;
