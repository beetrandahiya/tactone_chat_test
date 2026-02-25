import ChatInterface from "@/components/ChatInterface";
import TermsAccept from "@/components/TermsAccept";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <TermsAccept>
      <ErrorBoundary>
        <div className="h-screen bg-white flex flex-col">
          <ChatInterface />
        </div>
      </ErrorBoundary>
    </TermsAccept>
  );
}
