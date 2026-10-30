import { useEffect, useRef, useState } from 'react'

/**
 * Estado de los menús de la navbar: dropdown de perfil y menú móvil.
 * Cierra ambos al cambiar de ruta y el dropdown al hacer clic fuera.
 */
export default function useNavbarMenu(pathname) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    setMenuOpen(false)
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return undefined
    function handleClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return { menuOpen, setMenuOpen, mobileOpen, setMobileOpen, menuRef }
}
