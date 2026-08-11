import { crudControllerFactory } from "./crudControllerFactory.js";
import * as usuarioModel from "../models/usuarioModel.js";

export default crudControllerFactory(usuarioModel);
