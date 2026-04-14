import fs from "fs/promises";
import path from "path";

/**
 * Elimina un archivo de la carpeta de uploads de forma segura.
 * @param filePath Ruta relativa del archivo (ej: '/uploads/imagen.png')
 */
export async function deleteUpload(filePath: string | null | undefined) {
    if (!filePath || typeof filePath !== "string") return;

    // Solo eliminamos archivos que estén en la carpeta /uploads/
    if (!filePath.startsWith("/uploads/")) {
        console.log(`[File Manager] Ignorando eliminación: ${filePath} no es un archivo local de uploads.`);
        return;
    }

    // Evitar eliminar archivos por defecto si existen
    const dynamicDefaults = ["no-cover.png", "no-image.png"];
    if (dynamicDefaults.some(def => filePath.endsWith(def))) {
        console.log(`[File Manager] Ignorando eliminación: ${filePath} es un archivo por defecto.`);
        return;
    }

    try {
        const absolutePath = path.join(process.cwd(), "public", filePath);
        
        // Verificar si el archivo existe antes de intentar borrar
        try {
            await fs.access(absolutePath);
            await fs.unlink(absolutePath);
            console.log(`[File Manager] Archivo eliminado con éxito: ${absolutePath}`);
        } catch (err: any) {
            if (err.code === "ENOENT") {
                console.warn(`[File Manager] El archivo no existe en el disco: ${absolutePath}`);
            } else {
                throw err;
            }
        }
    } catch (error) {
        console.error(`[File Manager] Error crítico al intentar eliminar ${filePath}:`, error);
    }
}
