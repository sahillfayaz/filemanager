import { Component } from "react";

class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center bg-void p-6 text-white">
          <section className="max-w-lg rounded-3xl border border-danger/30 bg-danger/10 p-7 shadow-danger">
            <p className="mono-label text-danger">Application error</p>
            <h1 className="mt-2 text-2xl font-bold">SIFS could not render this screen.</h1>
            <p className="mt-3 text-sm leading-6 text-white/70">Refresh the page once. If this remains visible, copy the diagnostic message below and send it to the developer.</p>
            <pre className="mt-5 overflow-auto rounded-xl bg-black/30 p-4 text-xs text-danger/90">{this.state.error.message}</pre>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
