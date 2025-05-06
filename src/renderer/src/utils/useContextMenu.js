export function useContextMenu() {
  const handleContextMenu = (event) => {
    event.preventDefault()

    const selection = window.getSelection()
    const isTextSelected = selection && selection.toString().trim().length > 0

    const misspelledWord = isTextSelected ? selection.toString() : ''

    window.electron.showContextMenu({
      isTextSelected,
      misspelledWord,
      dictionarySuggestions: [] // Podés completar esto más adelante
    })
  }

  const registerContextMenu = () => {
    window.addEventListener('contextmenu', handleContextMenu)
  }

  const unregisterContextMenu = () => {
    window.removeEventListener('contextmenu', handleContextMenu)
  }

  return {
    registerContextMenu,
    unregisterContextMenu
  }
}
