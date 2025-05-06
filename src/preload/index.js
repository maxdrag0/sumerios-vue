import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  confirm: async (message) => {
    return await ipcRenderer.invoke('show-confirm', message)
  },
  alert: async (message) => {
    return await ipcRenderer.invoke('show-alert', message)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', {
      confirm: api.confirm,
      alert: api.alert
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.Electron = electronAPI
  window.Electron.confirm = api.confirm
  window.Electron.alert = api.alert
  window.api = api
}
