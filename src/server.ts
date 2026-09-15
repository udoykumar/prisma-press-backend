import app from "./app";
import { prisma } from "./lib/prisma";
import config from "./config";
import express from "express";
const port = config.port || 5000;

async function main() {
  try {
    // await prisma.$connect()
    console.log("connect to the database successfully");
    app.listen(port, () => {
      console.log(`server is running on port localhost:${port}`);
    });
  } catch (error) {
    console.log("error starting the server", error);
    // await prisma.$disconnect();
    process.exit(1);
  }
}
main();
