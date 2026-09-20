import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Site } from "./types";

const CONTENT_PATH = path.join(process.cwd(), "src", "data", "portofoliu-electrician-content.json");

export async function readSite(): Promise<Site> {
  const raw = await readFile(CONTENT_PATH, "utf-8");
  return JSON.parse(raw) as Site;
}

export async function writeSite(site: Site): Promise<void> {
  await writeFile(CONTENT_PATH, JSON.stringify(site, null, 2), "utf-8");
}
