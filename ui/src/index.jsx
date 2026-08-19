window.global = window // fix "global is not defined" error in react-image-lightbox

import ReactDOM from 'react-dom'
import './index.css'
// Aurelia redesign: self-hosted font + design tokens (see src/aurelia/tokens.css).
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import './aurelia/tokens.css'
import App from './App'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

ReactDOM.render(<App />, document.getElementById('root'))
