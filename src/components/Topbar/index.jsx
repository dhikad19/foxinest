const Topbar = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        top: "0",
        position: "sticky",
        backgroundColor: "orange",
        justifyContent: "space-between",
        padding: "10px",
      }}
    >
      <p>bar</p>
      <p>home</p>
      <p>data</p>
    </div>
  );
};

export default Topbar;
