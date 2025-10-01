import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";

import ScrollToTop from "@/components/Common/ScrollToTop";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack-server";
import { Toaster } from "react-hot-toast";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StackProvider app={stackServerApp}>
      <ReduxProvider>
        <CartModalProvider>
          <ModalProvider>
            <PreviewSliderProvider>
              <Header />
              <StackTheme>
                {children}
                <Toaster/>
              </StackTheme>
              <QuickViewModal />
              <CartSidebarModal />
              <PreviewSliderModal />
              <ScrollToTop />
              <Footer />
            </PreviewSliderProvider>
          </ModalProvider>
        </CartModalProvider>
      </ReduxProvider>
    </StackProvider>
  );
}