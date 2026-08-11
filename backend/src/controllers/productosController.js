import { crudControllerFactory } from "./crudControllerFactory.js";
import * as productoModel from "../models/productoModel.js";

export default crudControllerFactory(productoModel);
