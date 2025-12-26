interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string | undefined
          callback: (response: { credential: string }) => void
        }) => void
        renderButton: (
          element: HTMLElement | null,
          options: {
            theme: string
            size: string
            width?: string
            locale?: string
            text?: string
          }
        ) => void
      }
    }
  }
}
