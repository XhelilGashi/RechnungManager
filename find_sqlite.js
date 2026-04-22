import fs from "fs";
import path from "path";

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === "node_modules" || file === ".git" || file === "dist") continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else {
      const content = fs.readFileSync(fullPath, "utf-8");
      if (content.toLowerCase().includes("sqlite")) {
        console.log("FOUND IN:", fullPath);
      }
    }
  }
}

searchDir(process.cwd());
