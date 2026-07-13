import fs from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "src", "data");

export function readData(file) {
  const filePath = path.join(dataPath, file);

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeData(file, data) {
  const filePath = path.join(dataPath, file);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}