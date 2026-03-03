export default function BottomBar({activePanel,setActivePanel}){
     function toggle(panel) {
    setActivePanel(activePanel === panel ? null : panel);
  }

  return (
    <div className="bottom-bar">
      <button onClick={() => toggle("routes")}>
        Routes {activePanel === "routes" ? "⬇" : "⬆"}
      </button>

      <button onClick={() => toggle("history")}>
        History {activePanel === "history" ? "⬇" : "⬆"}
      </button>

      <button onClick={() => toggle("bookmarks")}>
        Bookmarks {activePanel === "bookmarks" ? "⬇" : "⬆"}
      </button>
    </div>
  );
}