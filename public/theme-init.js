/**
 * Menerapkan tema sebelum Vue di-mount agar tidak ada kedipan putih (FOUC).
 *
 * Sengaja diletakkan sebagai berkas terpisah, bukan <script> inline, supaya
 * Content-Security-Policy tetap bisa melarang script-src 'unsafe-inline'.
 */
;(function () {
  try {
    var tema = localStorage.getItem('titiklapor_theme')
    if (!tema) {
      tema = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-theme', tema)
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light')
  }
})()
