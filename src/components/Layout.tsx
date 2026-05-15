import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatBot from "./ChatBot";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1 pt-16">{children}</main>
    <Footer />
    <ChatBot />
  </div>
);

export default Layout;
