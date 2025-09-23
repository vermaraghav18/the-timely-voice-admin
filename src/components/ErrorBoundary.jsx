import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) {
    return { err };
  }
  componentDidCatch(err, info) {
    // eslint-disable-next-line no-console
    console.error("Admin runtime error:", err, info);
  }
  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {String(this.state.err?.message || this.state.err)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
