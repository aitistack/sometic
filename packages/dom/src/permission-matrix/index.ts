import { createControllableState } from "@sometic/core/controllable-state";
import { resolveRootStyle, type StyleableRootOptions } from "../internal/styleable.js";
import {
    getGridKeyboardAction,
    type GridKeyboardAction,
    type GridKeyboardEvent,
    type GridPosition,
} from "../internal/grid-navigation.js";

export type PermissionCellState = "allowed" | "denied" | "indeterminate";

export type PermissionMatrixResource = {
    id: string;
    label?: string;
};

export type PermissionMatrixAction = {
    id: string;
    label?: string;
};

export type PermissionMatrixViewModel = {
    resourceCount: number;
    actionCount: number;
    readOnly: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export type ResolvePermissionMatrixOptions = StyleableRootOptions & {
    resourceCount?: number;
    actionCount?: number;
    readOnly?: boolean;
    label?: string;
    labelledBy?: string;
};

export function resolvePermissionMatrix(
    options: ResolvePermissionMatrixOptions = {},
): PermissionMatrixViewModel {
    const styled = resolveRootStyle(options);
    const resourceCount = Math.max(0, Math.floor(options.resourceCount ?? 0));
    const actionCount = Math.max(0, Math.floor(options.actionCount ?? 0));
    const readOnly = options.readOnly === true;
    return {
        resourceCount,
        actionCount,
        readOnly,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "grid",
            "data-slot": "root",
            "data-readonly": readOnly ? "true" : "false",
            "data-empty": resourceCount === 0 || actionCount === 0 ? "true" : "false",
            "aria-rowcount": String(resourceCount + 1),
            "aria-colcount": String(actionCount + 1),
            ...(readOnly ? { "aria-readonly": "true" } : {}),
            ...(options.label === undefined ? {} : { "aria-label": options.label }),
            ...(options.labelledBy === undefined ? {} : { "aria-labelledby": options.labelledBy }),
        },
    };
}

export type PermissionMatrixCellViewModel = {
    resourceId: string;
    actionId: string;
    state: PermissionCellState;
    disabled: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export type ResolvePermissionMatrixCellOptions = StyleableRootOptions & {
    resourceId: string;
    actionId: string;
    state: PermissionCellState;
    disabled?: boolean;
    readOnly?: boolean;
    focused?: boolean;
    rowIndex?: number;
    columnIndex?: number;
    label?: string;
};

export function resolvePermissionMatrixCell(
    options: ResolvePermissionMatrixCellOptions,
): PermissionMatrixCellViewModel {
    const styled = resolveRootStyle(options);
    const disabled = options.disabled === true;
    const readOnly = options.readOnly === true;
    const ariaChecked =
        options.state === "indeterminate" ? "mixed" : options.state === "allowed" ? "true" : "false";
    return {
        resourceId: options.resourceId,
        actionId: options.actionId,
        state: options.state,
        disabled,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "gridcell",
            "data-slot": "cell",
            "data-resource": options.resourceId,
            "data-action": options.actionId,
            "data-state": options.state,
            "aria-checked": ariaChecked,
            "aria-label": options.label ?? `${options.actionId} on ${options.resourceId}`,
            ...(options.focused === undefined ? {} : { tabindex: options.focused ? "0" : "-1" }),
            ...(options.rowIndex === undefined
                ? {}
                : { "aria-rowindex": String(Math.max(0, Math.floor(options.rowIndex)) + 2) }),
            ...(options.columnIndex === undefined
                ? {}
                : { "aria-colindex": String(Math.max(0, Math.floor(options.columnIndex)) + 2) }),
            ...(readOnly ? { "aria-readonly": "true", "data-readonly": "true" } : {}),
            ...(disabled ? { "aria-disabled": "true", "data-disabled": "" } : {}),
        },
    };
}

export type PermissionMatrixValue = Record<string, boolean>;

export type CreatePermissionMatrixControllerOptions = {
    resources: readonly PermissionMatrixResource[];
    actions: readonly PermissionMatrixAction[];
    can?: (resourceId: string, actionId: string) => boolean | undefined;
    value?: PermissionMatrixValue;
    defaultValue?: PermissionMatrixValue;
    onValueChange?: (value: PermissionMatrixValue) => void;
    readOnly?: boolean;
    isCellDisabled?: (resourceId: string, actionId: string) => boolean;
    onAnnounce?: (message: string) => void;
};

export type PermissionMatrixController = {
    getResources(): readonly PermissionMatrixResource[];
    getActions(): readonly PermissionMatrixAction[];
    getValue(): PermissionMatrixValue;
    setValue(value: PermissionMatrixValue): void;
    getCellState(resourceId: string, actionId: string): PermissionCellState;
    isCellDisabled(resourceId: string, actionId: string): boolean;
    setCell(resourceId: string, actionId: string, allowed: boolean): void;
    toggleCell(resourceId: string, actionId: string): void;
    clearCell(resourceId: string, actionId: string): void;
    getGrantedKeys(): readonly string[];
    getFocusedCell(): GridPosition;
    setFocusedCell(position: GridPosition): void;
    getKeyboardAction(event: GridKeyboardEvent, dir?: "ltr" | "rtl"): GridKeyboardAction | undefined;
    resolve(options?: ResolvePermissionMatrixOptions): PermissionMatrixViewModel;
    resolveCell(
        resourceId: string,
        actionId: string,
        options?: Omit<
            ResolvePermissionMatrixCellOptions,
            "resourceId" | "actionId" | "state" | "readOnly"
        >,
    ): PermissionMatrixCellViewModel;
    dispose(): void;
};

export function permissionMatrixKey(resourceId: string, actionId: string): string {
    return `${resourceId}:${actionId}`;
}

export function createPermissionMatrixController(
    options: CreatePermissionMatrixControllerOptions,
): PermissionMatrixController {
    const resources = [...options.resources];
    const actions = [...options.actions];
    const readOnly = options.readOnly === true;
    let focused: GridPosition = { row: 0, column: 0 };
    let disposed = false;

    const value = createControllableState<PermissionMatrixValue>({
        defaultValue: options.defaultValue ?? {},
        ...(Object.prototype.hasOwnProperty.call(options, "value")
            ? { value: options.value ?? {} }
            : {}),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });

    const knownResource = (resourceId: string): boolean =>
        resources.some((resource) => resource.id === resourceId);
    const knownAction = (actionId: string): boolean =>
        actions.some((action) => action.id === actionId);

    const cellDisabled = (resourceId: string, actionId: string): boolean => {
        if (readOnly || disposed) {
            return true;
        }
        if (!knownResource(resourceId) || !knownAction(actionId)) {
            return true;
        }
        return options.isCellDisabled?.(resourceId, actionId) === true;
    };

    const cellState = (resourceId: string, actionId: string): PermissionCellState => {
        const override = value.get()[permissionMatrixKey(resourceId, actionId)];
        if (override !== undefined) {
            return override ? "allowed" : "denied";
        }
        if (!knownResource(resourceId) || !knownAction(actionId)) {
            return "indeterminate";
        }
        const baseline = options.can?.(resourceId, actionId);
        if (baseline === undefined) {
            return "indeterminate";
        }
        return baseline ? "allowed" : "denied";
    };

    const write = (resourceId: string, actionId: string, allowed: boolean): void => {
        if (cellDisabled(resourceId, actionId)) {
            return;
        }
        const key = permissionMatrixKey(resourceId, actionId);
        value.set({ ...value.get(), [key]: allowed });
        options.onAnnounce?.(`${actionId} on ${resourceId} ${allowed ? "allowed" : "denied"}`);
    };

    return {
        getResources: () => resources.map((resource) => ({ ...resource })),
        getActions: () => actions.map((action) => ({ ...action })),
        getValue: () => ({ ...value.get() }),
        setValue(next) {
            value.set({ ...next });
        },
        getCellState: cellState,
        isCellDisabled: cellDisabled,
        setCell(resourceId, actionId, allowed) {
            write(resourceId, actionId, allowed);
        },
        toggleCell(resourceId, actionId) {
            write(resourceId, actionId, cellState(resourceId, actionId) !== "allowed");
        },
        clearCell(resourceId, actionId) {
            if (cellDisabled(resourceId, actionId)) {
                return;
            }
            const next = { ...value.get() };
            delete next[permissionMatrixKey(resourceId, actionId)];
            value.set(next);
        },
        getGrantedKeys() {
            const keys: string[] = [];
            for (const resource of resources) {
                for (const action of actions) {
                    if (cellState(resource.id, action.id) === "allowed") {
                        keys.push(permissionMatrixKey(resource.id, action.id));
                    }
                }
            }
            return keys;
        },
        getFocusedCell: () => ({ ...focused }),
        setFocusedCell(position) {
            const row = Math.min(Math.max(0, position.row), Math.max(0, resources.length - 1));
            const column = Math.min(Math.max(0, position.column), Math.max(0, actions.length - 1));
            focused = { row, column };
        },
        getKeyboardAction(event, dir) {
            const action = getGridKeyboardAction(event, {
                rowCount: resources.length,
                columnCount: actions.length,
                position: focused,
                ...(dir === undefined ? {} : { dir }),
            });
            if (action?.type === "move") {
                focused = action.position;
            }
            return action;
        },
        resolve(styleOptions = {}) {
            return resolvePermissionMatrix({
                ...styleOptions,
                resourceCount: resources.length,
                actionCount: actions.length,
                readOnly,
            });
        },
        resolveCell(resourceId, actionId, cellOptions = {}) {
            const rowIndex = resources.findIndex((resource) => resource.id === resourceId);
            const columnIndex = actions.findIndex((action) => action.id === actionId);
            return resolvePermissionMatrixCell({
                ...cellOptions,
                resourceId,
                actionId,
                readOnly,
                state: cellState(resourceId, actionId),
                disabled: cellOptions.disabled ?? cellDisabled(resourceId, actionId),
                ...(rowIndex < 0 ? {} : { rowIndex }),
                ...(columnIndex < 0 ? {} : { columnIndex }),
                ...(cellOptions.focused === undefined
                    ? { focused: focused.row === rowIndex && focused.column === columnIndex }
                    : { focused: cellOptions.focused }),
            });
        },
        dispose() {
            disposed = true;
        },
    };
}

export type {
    GridKeyboardAction as PermissionMatrixKeyboardAction,
    GridPosition as PermissionMatrixPosition,
} from "../internal/grid-navigation.js";
