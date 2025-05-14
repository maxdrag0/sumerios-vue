const API_BASE_URL = 'http://192.168.0.1:8080/api'

// Administraciones
const API_ADM = `${API_BASE_URL}/administraciones`

// Consorcios (requiere el ID de la administración)
const API_CONSORCIOS = (idAdm) => `${API_ADM}/${idAdm}/consorcios`

const API_CONSORCIO = (idAdm, idConsorcio) => `${API_ADM}/${idAdm}/consorcios/${idConsorcio}`

// Unidades Funcionales (requiere el ID del consorcio)
const API_UF = (idAdm, idConsorcio) =>
  `${API_CONSORCIOS(idAdm)}/${idConsorcio}/unidades_funcionales`

export { API_BASE_URL, API_ADM, API_CONSORCIOS, API_CONSORCIO, API_UF }
