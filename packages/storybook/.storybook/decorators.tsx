import { chromeStorageMock } from "@argent-x/extension/src/shared/storage/__test__/chrome-storage.mock"
import {
  FixedGlobalStyle,
  ThemeProvider as StyledComponentsThemeProvider,
  ThemedGlobalStyle,
  muiTheme,
} from "@argent-x/extension/src/ui/theme"
import { ThemeProvider as MuiThemeProvider } from "@mui/material"
import React from "react"

/** polyfill browser extension storage  */
global.chrome = {
  ...global.chrome,
  runtime: {
    ...global.chrome.runtime,
    id: "test",
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  storage: chromeStorageMock,
}

export const decorators = [
  (Story) => (
    <MuiThemeProvider theme={muiTheme}>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />
      <FixedGlobalStyle extensionIsInTab={false} />
      <StyledComponentsThemeProvider>
        <ThemedGlobalStyle />
        <Story />
      </StyledComponentsThemeProvider>
    </MuiThemeProvider>
  ),
]
