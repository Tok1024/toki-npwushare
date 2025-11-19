import { exec } from 'child_process'
import { mkdir, readdir, copyFile } from 'fs/promises'
import path from 'path'
import os from 'os'

const isWindows: boolean = os.platform() === 'win32'

const copyDirectory = async (src: string, dest: string): Promise<void> => {
  try {
    await mkdir(dest, { recursive: true })
    const entries = await readdir(src, { withFileTypes: true })

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)

      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath)
      } else {
        await copyFile(srcPath, destPath)
      }
    }
  } catch (error) {
    console.error(`Error copying directory from ${src} to ${dest}:`, error)
    throw error
  }
}

const copyFiles = async () => {
  try {
    if (isWindows) {
      console.log('Detected Windows OS. Using fs module for copying files.')

      await copyDirectory('public', '.next/standalone/public')
      await copyDirectory('.next/static', '.next/standalone/.next/static')
      console.log('Files copied successfully.')
    } else {
      console.log(
        'Detected non-Windows OS. Using cp command for copying files.'
      )

      const commands: string[] = [
        'cp -r public .next/standalone/',
        'cp -r .next/static .next/standalone/.next/'
      ]

      for (const command of commands) {
        await new Promise<void>((resolve, reject) => {
          exec(command, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error executing command "${command}":`, error)
              reject(error)
              return
            }
            if (stdout) console.log(stdout)
            if (stderr) console.error(stderr)
            resolve()
          })
        })
      }
    }
  } catch (fsError) {
    console.error('Error copying files:', fsError)
    process.exit(1)
  }
}

copyFiles()
