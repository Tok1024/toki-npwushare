import { cp } from 'fs/promises'

const copyFiles = async () => {
  try {
    console.log('Starting postbuild file copy...')

    // 使用 Node.js 原生 cp (Node 16.7+)
    // 这比 exec('cp -r') 更安全，且跨平台
    await cp('public', '.next/standalone/public', { recursive: true, force: true })
    await cp('.next/static', '.next/standalone/.next/static', { recursive: true, force: true })
    
    console.log('Files copied successfully.')
  } catch (error) {
    console.error('Error during file copy:', error)
    process.exit(1)
  }
}

copyFiles()
