import { crudRoutesFactory } from "./crudRoutesFactory.js";
import usuariosController from "../controllers/usuariosController.js";

export default crudRoutesFactory(usuariosController);
