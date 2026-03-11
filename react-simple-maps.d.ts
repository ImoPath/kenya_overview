declare module "react-simple-maps" {
  import { ComponentType } from "react";

  export const ComposableMap: ComponentType<{
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }>;

  export const ZoomableGroup: ComponentType<{
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    children?: React.ReactNode;
  }>;

  export interface GeographiesChildProps {
    geographies: Array<{
      rsmKey: string;
      properties?: Record<string, unknown> & { NAME_1?: string };
      [key: string]: unknown;
    }>;
  }

  export const Geographies: ComponentType<{
    geography: string;
    children: (props: GeographiesChildProps) => React.ReactNode;
  }>;

  export const Geography: ComponentType<{
    geography: GeographiesChildProps["geographies"][number];
    stroke?: string;
    strokeWidth?: number;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    [key: string]: unknown;
  }>;
}
