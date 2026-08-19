window.global = window // fix "global is not defined" error in react-image-lightbox

import ReactDOM from 'react-dom'
import './index.css'
// Redesign: self-hosted font + design tokens (themes/tokens.css).
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import './themes/tokens.css'
import App from './App'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

ReactDOM.render(<App />, document.getElementById('root'))
