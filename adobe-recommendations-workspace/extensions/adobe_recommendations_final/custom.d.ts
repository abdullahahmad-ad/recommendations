declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module "*.module.css" {
  const content: Record<string, string>;
  export default content;
}

interface Window {
  get_extension_asset: (path: string) => string;
}
