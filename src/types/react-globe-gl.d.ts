// Type declarations for packages without built-in types

declare module 'react-globe.gl' {
  import { Component, Ref } from 'react'

  interface GlobeProps {
    ref?: Ref<any>
    width?: number
    height?: number

    // Globe appearance
    globeImageUrl?: string
    bumpImageUrl?: string
    backgroundImageUrl?: string
    showAtmosphere?: boolean
    atmosphereColor?: string
    atmosphereAltitude?: number

    // Points layer
    pointsData?: object[]
    pointLat?: string | ((d: object) => number)
    pointLng?: string | ((d: object) => number)
    pointColor?: string | ((d: object) => string)
    pointRadius?: string | number | ((d: object) => number)
    pointAltitude?: string | number | ((d: object) => number)
    pointLabel?: string | ((d: object) => string)
    onPointClick?: (point: object, event: MouseEvent) => void
    onPointHover?: (point: object | null, prevPoint: object | null) => void

    // Rings layer
    ringsData?: object[]
    ringLat?: string | ((d: object) => number)
    ringLng?: string | ((d: object) => number)
    ringColor?: string | ((d: object) => string | string[])
    ringMaxRadius?: string | number | ((d: object) => number)
    ringPropagationSpeed?: string | number | ((d: object) => number)
    ringRepeatPeriod?: string | number | ((d: object) => number)

    // Arcs layer
    arcsData?: object[]

    // Hex bin layer
    hexBinPointsData?: object[]

    // Labels layer
    labelsData?: object[]

    // Custom layer
    customLayerData?: object[]

    // Polygons layer
    polygonsData?: object[]

    // Paths layer
    pathsData?: object[]

    // HTML elements layer
    htmlElementsData?: object[]

    [key: string]: any
  }

  const Globe: React.ForwardRefExoticComponent<GlobeProps & React.RefAttributes<any>>
  export default Globe
}
