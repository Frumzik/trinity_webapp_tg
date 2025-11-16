import TextPage from "../../shared/ui/TextPage/index";
import { aboutContent } from "./content";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import TopBar from "../../widgets/topbarTextpage/index";

import Footer from "../../widgets/footer/footer";

export default function Index() {
  return (
    <div className="app" style={{ ["--gbutton-h" as any]: "60px" }}>
      <TopBar title="Пользовательское соглашение" />

      <main className="screen">
        <ScrollPanel
          maxHeight="75dvh"
          vars={{
            railRight: "-15px",
            railTop: "4px",
            railBottom: "4px",
            railWidth: "3px",
            railColor: "#E8E8E8",
            thumbColor: "#C7C7C7",
            zIndex: 20,
          }}
        >
          <TextPage sections={aboutContent.sections} />
        </ScrollPanel>
      </main>
      <Footer />
    </div>
  );
}
