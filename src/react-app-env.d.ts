/// <reference types="react-scripts" />
/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare module "*.css";
declare module "*.less";
declare module "*.scss";
declare module "*.svg";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.bmp";
declare module "*.tiff";

declare global {
  interface Window {
    globalConfig?: any;
  }
}
