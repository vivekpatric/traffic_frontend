export default function BottomSheet({activePanel,children}){
    return (
    <div className={`bottom-sheet ${activePanel ? "open" : ""}`}>
      {children}
    </div>
  );
}