<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const theme = ref<'light' | 'dark'>('light')

function applyTheme(t: 'light' | 'dark') {
  theme.value = t
  if (t === 'dark') document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
  try { localStorage.setItem('essenfont-theme', t) } catch {}
}

function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

onMounted(() => {
  try {
    const s = localStorage.getItem('essenfont-theme')
    if (s === 'light' || s === 'dark') applyTheme(s)
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark')
  } catch {}
})
</script>

<template>
  <div class="layout">
    <nav class="nav">
      <div class="nav-inner">
        <RouterLink to="/" class="nav-logo">
          <img src="/logo.svg" alt="Essenfont" width="32" height="32" />
          <span class="nav-word">Essenfont</span>
          <span class="nav-tag">Unicode 17</span>
        </RouterLink>
        <div class="nav-links">
          <RouterLink to="/unicode" class="nav-link">Browse</RouterLink>
          <RouterLink to="/donors" class="nav-link">Donors</RouterLink>
          <RouterLink to="/download" class="nav-link">Download</RouterLink>
          <RouterLink to="/about" class="nav-link">About</RouterLink>
          <a
            href="https://github.com/essenfont/essenfont"
            class="nav-link"
            target="_blank"
            rel="noopener"
          >GitHub ↗</a>
          <button
            type="button"
            class="nav-icon-btn theme-toggle"
            :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
            :title="theme === 'dark' ? 'Light mode' : 'Dark mode'"
            @click="toggleTheme"
          >
            <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <circle cx="12" cy="12" r="4.4" fill="currentColor"/>
              <g stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                <line x1="12" y1="2.5" x2="12" y2="5"/>
                <line x1="12" y1="19" x2="12" y2="21.5"/>
                <line x1="2.5" y1="12" x2="5" y2="12"/>
                <line x1="19" y1="12" x2="21.5" y2="12"/>
                <line x1="5.2" y1="5.2" x2="6.9" y2="6.9"/>
                <line x1="17.1" y1="17.1" x2="18.8" y2="18.8"/>
                <line x1="5.2" y1="18.8" x2="6.9" y2="17.1"/>
                <line x1="17.1" y1="6.9" x2="18.8" y2="5.2"/>
              </g>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M20.5 14.3A8.6 8.6 0 0 1 9.7 3.5a8.6 8.6 0 1 0 10.8 10.8z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
    <main class="main">
      <slot />
    </main>
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-col">
          <img src="/logo.svg" alt="" width="24" height="24" />
          <div>
            <div class="footer-title">Essenfont</div>
            <div class="footer-sub">Universal Unicode 17 font · OFL 1.1</div>
          </div>
        </div>
        <div class="footer-cols">
          <div class="footer-group">
            <div class="footer-heading">Font</div>
            <RouterLink to="/download">Download</RouterLink>
            <RouterLink to="/about">About</RouterLink>
            <RouterLink to="/unicode">Unicode browser</RouterLink>
          </div>
          <div class="footer-group">
            <div class="footer-heading">Source</div>
            <a href="https://github.com/essenfont/essenfont" target="_blank" rel="noopener">GitHub</a>
            <a href="https://github.com/essenfont/essenfont/releases" target="_blank" rel="noopener">Releases</a>
            <a href="https://github.com/essenfont/essenfont/issues" target="_blank" rel="noopener">Issues</a>
          </div>
          <div class="footer-group">
            <div class="footer-heading">Standards</div>
            <a href="https://www.unicode.org/" target="_blank" rel="noopener">Unicode Consortium</a>
            <a href="https://scripts.sil.org/OFL" target="_blank" rel="noopener">SIL OFL 1.1</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© {{ new Date().getFullYear() }} Essenfont contributors.</span>
        <span class="footer-sep">·</span>
        <span>Licensed under the <a href="https://scripts.sil.org/OFL" target="_blank" rel="noopener">SIL Open Font License 1.1</a>.</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.layout { min-height: 100vh; display: flex; flex-direction: column; background: var(--spec-paper); }

.nav {
  position: sticky; top: 0; z-index: 100;
  background: var(--spec-paper);
  border-bottom: 1px solid var(--spec-rule);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.nav-inner {
  max-width: 1320px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 56px);
  display: flex; align-items: center; justify-content: space-between;
  height: var(--vp-nav-height);
  animation: ef-fade-in 0.4s ease-out both;
}
.nav-logo {
  display: flex; align-items: center; gap: 0.6rem;
  text-decoration: none;
  color: var(--spec-ink);
}
.nav-logo:hover { text-decoration: none; }
.nav-word {
  font-family: var(--spec-font-display);
  font-weight: 500;
  font-size: 1.25rem;
  letter-spacing: -0.01em;
}
.nav-tag {
  font-family: var(--spec-font-mono);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--spec-rose);
  padding: 0.15rem 0.45rem;
  border: 1px solid var(--spec-rose);
  border-radius: 3px;
}

.nav-links { display: flex; gap: 1.25rem; align-items: center; }
.nav-link {
  font-family: var(--spec-font-mono);
  font-size: 0.78rem; font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase;
  text-decoration: none;
  color: var(--spec-ink-soft);
  transition: color 0.2s;
  position: relative;
}
.nav-link::after {
  content: "";
  position: absolute;
  left: 0; right: 0; bottom: -4px;
  height: 1.5px;
  background: var(--spec-rose);
  background-size: 0% 100%;
  background-repeat: no-repeat;
  transition: background-size 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.nav-link:hover { color: var(--spec-rose); text-decoration: none; }
.nav-link:hover::after { background-size: 100% 100%; }
.nav-link.router-link-active { color: var(--spec-rose); }
.nav-link.router-link-active::after { background-size: 100% 100%; }

.nav-icon-btn {
  background: none;
  border: 1px solid transparent;
  color: var(--spec-ink-soft);
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.2s, border-color 0.2s;
}
.nav-icon-btn:hover {
  color: var(--spec-rose);
  border-color: var(--spec-rule);
}

.main { flex: 1; }

.footer {
  margin-top: 4rem;
  border-top: 1px solid var(--spec-rule);
  background: var(--spec-paper-deep);
  padding: 2.5rem 1.5rem 1.5rem;
}
.footer-inner {
  max-width: 1320px; margin: 0 auto;
  display: flex; gap: 3rem; justify-content: space-between; flex-wrap: wrap;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--spec-rule);
}
.footer-col {
  display: flex; align-items: center; gap: 0.75rem;
}
.footer-title {
  font-family: var(--spec-font-display);
  font-size: 1rem;
  font-weight: 500;
  color: var(--spec-ink);
}
.footer-sub {
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  color: var(--spec-mute);
  letter-spacing: 0.05em;
}
.footer-cols {
  display: flex; gap: 3rem; flex-wrap: wrap;
}
.footer-group {
  display: flex; flex-direction: column; gap: 0.4rem;
}
.footer-heading {
  font-family: var(--spec-font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--spec-mute);
  margin-bottom: 0.25rem;
}
.footer-group a {
  font-family: var(--spec-font-body);
  font-size: 0.85rem;
  color: var(--spec-ink-soft);
  text-decoration: none;
  transition: color 0.15s;
}
.footer-group a:hover { color: var(--spec-rose); }

.footer-bottom {
  max-width: 1320px; margin: 1.5rem auto 0;
  display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
  font-family: var(--spec-font-mono);
  font-size: 0.72rem;
  color: var(--spec-mute);
}
.footer-bottom a { color: var(--spec-ink-soft); }
.footer-bottom a:hover { color: var(--spec-rose); }
.footer-sep { opacity: 0.5; }

@media (max-width: 768px) {
  .nav-inner { padding: 0 1rem; }
  .nav-links { gap: 0.75rem; }
  .nav-tag { display: none; }
  .footer-inner { gap: 2rem; }
}
</style>