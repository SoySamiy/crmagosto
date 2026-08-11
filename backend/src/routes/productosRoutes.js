import { crudRoutesFactory } from "./crudRoutesFactory.js";
import productosController from "../controllers/productosController.js";

export default crudRoutesFactory(productosController);
