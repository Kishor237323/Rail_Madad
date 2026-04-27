import type { CapacitorConfig } from '@capacitor/cli'

const appUrl = process.env.CAPACITOR_APP_URL?.trim()

const config: CapacitorConfig = {
  appId: 'com.railmadad.app',
  appName: 'Rail Madad',
  webDir: 'public',
  server: appUrl
    ? {
        url: appUrl,
        cleartext: appUrl.startsWith('http://'),
      }
    : undefined,
}

export default config