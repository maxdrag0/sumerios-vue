export const showConfirmDialog = async (message) => {
  if (!window.api || !window.api.confirm) {
    throw new Error('La API de Electron no está disponible')
  }
  const confirmed = await window.api.confirm(message)
  return confirmed
}

export const showErrorDialog = async (error) => {
  if (error.response && error.response.data) {
    const mensaje =
      typeof error.response.data === 'string'
        ? error.response.data
        : error.response.data.message || JSON.stringify(error.response.data)

    window.api.alert(mensaje)
  }
}
