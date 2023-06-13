import { DBM } from "./../common/dbm";
import getLogger from "./log4js";
import { resolve } from "path";
const ROOT = resolve(__dirname, "../../");
require("dotenv").config({ path: `${ROOT}/.env.${process.env.USE_ENV}` });

const logger = getLogger("db.ts");

console.log("db:", process.env.MYSQL_HOST, process.env.MYSQL_PORT);

const orm = new DBM({
  connectionLimit: 10,
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: "root",
  password: "root",
  database: "cloud_auto",
  isDebug: true,
});

orm.setLogger(logger as any);

export default orm;
