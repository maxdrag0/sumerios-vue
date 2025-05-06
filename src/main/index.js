import { app, shell, BrowserWindow, ipcMain, dialog, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: join(__dirname, '../../resources/icono.ico'),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  ipcMain.handle('show-confirm', async (event, message) => {
    const response = await dialog.showMessageBox(BrowserWindow.fromWebContents(event.sender), {
      type: 'question',
      buttons: ['Cancelar', 'Aceptar'],
      defaultId: 1,
      title: 'Confirmación',
      message
    })
    return response.response === 1
  })

  ipcMain.handle('show-alert', async (event, message) => {
    const response = await dialog.showMessageBox(BrowserWindow.fromWebContents(event.sender), {
      type: 'info',
      buttons: ['Aceptar'],
      defaultId: 0,
      title: 'Alerta',
      message
    })
    return response.response === 0
  })

  // mainWindow.webContents.openDevTools()

  return mainWindow
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.mad.sumerios')

  // import dinámico de un ESM desde CommonJS:
  const { default: contextMenu } = await import('electron-context-menu')

  // ahora configuras el menú en todas las ventanas:
  contextMenu({
    showCopy: true,
    showPaste: true,
    spellcheck: true
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const mainWindow = createWindow()
})

app.whenReady().then(() => {
  session.defaultSession.setSpellCheckerLanguages(['es-ES', 'en-US'])
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// app.on('will-quit', () => {
//   if (backendProcess) {
//     console.log('Cerrando el backend...')
//     backendProcess.kill('SIGINT')
//   }
// })
