import React from 'react';
import ErrorPage from './ErrorPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console (you can also send to error reporting service)
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    // Reset the error state and try to re-render children
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    // Reset error state and navigate home
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use ErrorPage
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Determine error type based on error message
      let errorType = 'general';
      const errorMessage = this.state.error?.message?.toLowerCase() || '';

      if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
        errorType = 'network';
      } else if (errorMessage.includes('server') || errorMessage.includes('500')) {
        errorType = 'server';
      } else if (errorMessage.includes('database') || errorMessage.includes('db')) {
        errorType = 'database';
      } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        errorType = '404';
      }

      return (
        <ErrorPage
          errorType={errorType}
          message={this.state.error?.message || "An unexpected error occurred"}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;