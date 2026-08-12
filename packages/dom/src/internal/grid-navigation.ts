export type GridPosition = {
    row: number;
    column: number;
};

export type GridKeyboardEvent = {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
};

export type GridKeyboardAction =
    { type: "move"; position: GridPosition } | { type: "toggle" } | { type: "activate" };

export type GetGridKeyboardActionOptions = {
    rowCount: number;
    columnCount: number;
    position: GridPosition;
    dir?: "ltr" | "rtl";
    pageSize?: number;
};

function clamp(value: number, max: number): number {
    if (value < 0) {
        return 0;
    }
    if (value > max) {
        return max;
    }
    return value;
}

export function getGridKeyboardAction(
    event: GridKeyboardEvent,
    options: GetGridKeyboardActionOptions,
): GridKeyboardAction | undefined {
    const lastRow = Math.floor(options.rowCount) - 1;
    const lastColumn = Math.floor(options.columnCount) - 1;
    if (lastRow < 0 || lastColumn < 0) {
        return undefined;
    }

    const row = clamp(options.position.row, lastRow);
    const column = clamp(options.position.column, lastColumn);
    const dir = options.dir ?? "ltr";
    const forwardKey = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backwardKey = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    const pageSize = Math.max(1, Math.floor(options.pageSize ?? 10));
    const jumpToEdge = event.ctrlKey === true || event.metaKey === true;

    const move = (nextRow: number, nextColumn: number): GridKeyboardAction | undefined => {
        const target = { row: clamp(nextRow, lastRow), column: clamp(nextColumn, lastColumn) };
        if (target.row === row && target.column === column) {
            return undefined;
        }
        return { type: "move", position: target };
    };

    if (event.key === "ArrowDown") {
        return move(row + 1, column);
    }
    if (event.key === "ArrowUp") {
        return move(row - 1, column);
    }
    if (event.key === forwardKey) {
        return move(row, column + 1);
    }
    if (event.key === backwardKey) {
        return move(row, column - 1);
    }
    if (event.key === "PageDown") {
        return move(row + pageSize, column);
    }
    if (event.key === "PageUp") {
        return move(row - pageSize, column);
    }
    if (event.key === "Home") {
        return jumpToEdge ? move(0, 0) : move(row, 0);
    }
    if (event.key === "End") {
        return jumpToEdge ? move(lastRow, lastColumn) : move(row, lastColumn);
    }
    if (event.key === " ") {
        return { type: "toggle" };
    }
    if (event.key === "Enter") {
        return { type: "activate" };
    }
    return undefined;
}
