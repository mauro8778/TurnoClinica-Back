import express from "express";
import router from "./routes/indexRoutes";
import cors from "cors";

const server = express();

server.use(express.json());

const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

server.use(cors(corsOptions));

server.use(router);

export default server;
