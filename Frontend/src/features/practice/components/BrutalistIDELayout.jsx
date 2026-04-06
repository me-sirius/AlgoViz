import React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useDrag, useDrop } from "react-dnd";

const ITEM_TYPES = { PANEL: "panel" };

const DraggableHeaderWrapper = ({ id, children }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ITEM_TYPES.PANEL,
        item: { id },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }));
    return (
        <div ref={drag} className={`cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}>
            {children}
        </div>
    );
};

const DroppablePanel = ({ id, onSwap, children, className }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ITEM_TYPES.PANEL,
        drop: (item) => onSwap(item.id, id),
        collect: (monitor) => ({ isOver: monitor.isOver() }),
    }));
    return (
        <div ref={drop} className={`flex-1 flex flex-col min-h-0 relative ${className} ${isOver ? "ring-2 ring-orange-500 ring-inset" : ""}`}>
            {children}
        </div>
    );
};

const BrutalistIDELayout = ({
    leftPanelContent,
    editorPanelContent,
    consolePanelContent,
    leftHeader,
    editorHeader,
    consoleHeader,
    isDarkMode,
    themeStyles,
    slots,
    onSlotsChange,
    leftPanelRef
}) => {
    const handleSwap = (dragId, dropId) => {
        const dragSlot = Object.keys(slots).find(key => slots[key] === dragId);
        const dropSlot = Object.keys(slots).find(key => slots[key] === dropId);
        if (dragSlot && dropSlot && dragSlot !== dropSlot) {
            onSlotsChange({ ...slots, [dragSlot]: slots[dropSlot], [dropSlot]: slots[dragSlot] });
        }
    };

    const renderContent = (id) => {
        switch (id) {
            case 'left': return leftPanelContent;
            case 'editor': return editorPanelContent;
            case 'console': return consolePanelContent;
            default: return null;
        }
    };

    const renderHeader = (id) => {
        switch (id) {
            case 'left': return leftHeader;
            case 'editor': return editorHeader;
            case 'console': return consoleHeader;
            default: return <div className="p-2 font-mono text-xs">Panel</div>;
        }
    };

    // Brutalist panel styling: solid opaque, 0px radius, 1px ghost borders
    const panelClass = isDarkMode
        ? "bg-[#201f1f] border border-[rgba(255,255,255,0.10)]"
        : "bg-white border border-slate-200";

    return (
        <PanelGroup direction="horizontal" className="gap-[2px] bg-[#0e0e0e]">
            {/* LEFT SLOT */}
            <Panel ref={leftPanelRef} defaultSize={42} minSize={20} className={`flex flex-col overflow-hidden ${panelClass}`}>
                <DroppablePanel id={slots.slotA} onSwap={handleSwap} className="h-full">
                    <DraggableHeaderWrapper id={slots.slotA}>
                        {renderHeader(slots.slotA)}
                    </DraggableHeaderWrapper>
                    <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
                        {renderContent(slots.slotA)}
                    </div>
                </DroppablePanel>
            </Panel>

            <PanelResizeHandle className="w-[2px] bg-[#0a0a0a] hover:bg-orange-500/60 transition-colors z-20 flex justify-center items-center group focus:outline-none" />

            {/* RIGHT SIDE */}
            <Panel className="flex flex-col">
                <PanelGroup direction="vertical" className="gap-[2px]">
                    {/* TOP RIGHT SLOT */}
                    <Panel defaultSize={70} minSize={10} className={`flex flex-col overflow-hidden ${panelClass}`}>
                        <DroppablePanel id={slots.slotB} onSwap={handleSwap} className="h-full">
                            <DraggableHeaderWrapper id={slots.slotB}>
                                {renderHeader(slots.slotB)}
                            </DraggableHeaderWrapper>
                            <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
                                {renderContent(slots.slotB)}
                            </div>
                        </DroppablePanel>
                    </Panel>

                    <PanelResizeHandle className="h-[2px] bg-[#0a0a0a] hover:bg-orange-500/60 cursor-ns-resize transition-colors z-20 flex justify-center items-center group focus:outline-none" />

                    {/* BOTTOM RIGHT SLOT */}
                    <Panel defaultSize={30} minSize={5} className={`flex flex-col overflow-hidden ${panelClass}`}>
                        <DroppablePanel id={slots.slotC} onSwap={handleSwap} className="h-full">
                            <DraggableHeaderWrapper id={slots.slotC}>
                                {renderHeader(slots.slotC)}
                            </DraggableHeaderWrapper>
                            <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
                                {renderContent(slots.slotC)}
                            </div>
                        </DroppablePanel>
                    </Panel>
                </PanelGroup>
            </Panel>
        </PanelGroup>
    );
};

export default BrutalistIDELayout;
