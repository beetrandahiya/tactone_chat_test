import ChatInterface from "@/components/ChatInterface";
import TermsAccept from "@/components/TermsAccept";

export default function Home() {
  return (
    <TermsAccept>
      <div className="h-screen bg-white flex flex-col">
        <ChatInterface />
      </div>
    </TermsAccept>
  );
}
