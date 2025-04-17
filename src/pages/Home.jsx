import Section from "../components/Section";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
const Home = () => {
  return (
    <div style={{ display: "flex", width: "100%" }}>
      <Sidebar />
      <div style={{ width: "100%" }}>
        <Topbar />
        <Section />
      </div>
    </div>
  );
};

export default Home;
