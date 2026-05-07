import { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { AlertTriangle, RefreshCw, Home, Copy, Bug } from "lucide-react";
import { useState } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

const ErrorFallback = ({ error, errorInfo, onRetry }: { error: Error | null; errorInfo: string | null; onRetry: () => void }) => {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleCopy = () => {
    const text = `${error?.message}\n${errorInfo || ""}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="text-center max-w-lg w-full">
        <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Something Went Wrong
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          We encountered an unexpected error. Our team has been notified if this is a recurring issue.
        </p>
        
        <div className="bg-card border rounded-xl p-4 mb-6 text-left">
          <p className="text-sm font-medium text-foreground mb-1">Error Details</p>
          <p className="text-xs text-muted-foreground font-mono truncate">
            {error?.message || "Unknown error occurred"}
          </p>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-primary mt-2 hover:underline flex items-center gap-1"
          >
            <Bug className="w-3 h-3" />
            {showDetails ? "Hide" : "Show"} technical details
          </button>
          {showDetails && (
            <pre className="text-xs text-muted-foreground mt-2 p-3 bg-muted rounded overflow-x-auto max-h-40 scrollbar-thin">
              {errorInfo || error?.stack}
            </pre>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <Button onClick={onRetry} size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Link to="/">
            <Button variant="outline" size="lg">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="text-muted-foreground">
          {copied ? (
            <span className="text-success flex items-center gap-1">Copied!</span>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copy error details
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo.componentStack);
    
    // In production, send to error tracking service (Sentry, LogRocket, etc.)
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    // }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
