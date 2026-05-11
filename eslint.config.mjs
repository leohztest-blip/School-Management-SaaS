import nextVitals from 'eslint-config-next/core-web-vitals'

const config = [
  ...nextVitals,
  {
    ignores: ['edge-functions/**', '.next/**', 'mnt/**'],
  },
]

export default config
