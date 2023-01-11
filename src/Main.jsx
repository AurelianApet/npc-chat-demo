import React, { Suspense } from "react"
import ReactDOM from "react-dom/client"

import App from "./components/App"
import { ThemeWrapper } from 'retro-ui'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense>
    <ThemeWrapper>
      <App />
    </ThemeWrapper>
    </Suspense>
  </React.StrictMode>,
)
