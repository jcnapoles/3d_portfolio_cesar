import { Component } from "react";

let webglSupport = null;

/** One cached probe (the test context is released right away), so no-WebGL devices never even try. */
function supportsWebGL() {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    webglSupport = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

/**
 * Added in the restore: without WebGL (blocked, unsupported, or a context that cannot be created) the 2024 page used
 * to throw and take the whole site down. Now the 3D scene is simply skipped (no console noise from three.js when
 * WebGL is unavailable), and any later render error in a scene only removes that canvas.
 */
export default class CanvasBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.warn("[legacy] 3D canvas disabled:", error?.message || error);
  }

  render() {
    return this.state.failed || !supportsWebGL() ? null : this.props.children;
  }
}
