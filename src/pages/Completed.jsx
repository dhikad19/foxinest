import Section from "../components/Section/Completed";
// import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
const Completed = () => {
  return (
    <div style={{ display: "flex", width: "100%" }}>
      {/* <Sidebar /> */}
      <div style={{ width: "100%" }}>
        <Topbar />
        <Section />
      </div>
    </div>
  );
};

export default Completed;
