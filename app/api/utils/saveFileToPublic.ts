import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * Save file to both source public directory and standalone build public directory (if exists).
 * This ensures files are persistent (source) and immediately served (standalone).
 */
export const saveFileToPublic = async (
  relativePath: string,
  fileName: string,
  data: Buffer
) => {
  const cwd = process.cwd()
  
  // 1. Path to source public directory (Persistent)
  const sourceDir = join(cwd, 'public', relativePath)
  
  // 2. Path to standalone public directory (Runtime serving)
  const standaloneDir = join(cwd, '.next', 'standalone', 'public', relativePath)

  const paths = [sourceDir]
  
  // Only add standalone path if it's different and the base standalone dir exists
  // (meaning we are likely running in standalone mode or have built it)
  if (sourceDir !== standaloneDir && existsSync(join(cwd, '.next', 'standalone'))) {
    paths.push(standaloneDir)
  }

  for (const dir of paths) {
    try {
      await mkdir(dir, { recursive: true })
      await writeFile(join(dir, fileName), data)
    } catch (error) {
      console.error(`Failed to save file to ${dir}:`, error)
      // We don't throw here to ensure at least one write might succeed, 
      // but in practice if source fails, we have bigger problems.
    }
  }
}
