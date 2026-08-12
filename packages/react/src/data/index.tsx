import {
    createElement,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type HTMLAttributes,
    type ChangeEvent as ReactChangeEvent,
    type KeyboardEvent as ReactKeyboardEvent,
    type ReactElement,
    type ReactNode,
} from "react";
import {
    createDataTableController,
    getDataTableKeyboardAction,
    resolveDataTable,
    resolveDataTableCell,
    resolveDataTableCheckbox,
    resolveDataTableHeader,
    resolveDataTableRow,
    type DataTableColumn,
    type DataTableController,
    type DataTableGridPosition,
    type DataTableMode,
    type FetchRowsArgs,
    type FetchRowsResult,
    type SelectionState,
    type SortingState,
} from "@sometic/dom/data-table";
import {
    createUploadController,
    createUploadDropzoneController,
    resolveUploadItem,
    resolveUploadList,
    type UploadController,
    type UploadDropzoneController,
    type UploadItem,
    type UploadTransport,
} from "@sometic/dom/upload";
import {
    createPermissionMatrixController,
    type CreatePermissionMatrixControllerOptions,
    type PermissionMatrixAction,
    type PermissionMatrixController,
    type PermissionMatrixResource,
    type PermissionMatrixValue,
} from "@sometic/dom/permission-matrix";
import {
    createNotificationCenterController,
    type NotificationCenterController,
    type NotificationItem,
    type NotificationsController,
} from "@sometic/dom/notification-center";
import {
    createSchemaForm,
    type SchemaFieldDescriptor,
    type SchemaFormController,
    type SchemaFormValues,
} from "@sometic/forms/schema-form";

function joinClassNames(...values: (string | undefined)[]): string | undefined {
    const merged = values.filter((value) => value !== undefined && value.length > 0).join(" ");
    return merged.length === 0 ? undefined : merged;
}

function withoutBooleanAttributes(attributes: Record<string, string>): Record<string, string> {
    const next: Record<string, string> = {};
    for (const [key, value] of Object.entries(attributes)) {
        if (key === "checked" || key === "disabled") {
            continue;
        }
        next[key] = value;
    }
    return next;
}

function useRerender(): () => void {
    const [, setTick] = useState(0);
    return useCallback(() => {
        setTick((tick) => tick + 1);
    }, []);
}

export type DataTableProps<TRow> = Omit<HTMLAttributes<HTMLTableElement>, "children"> & {
    columns: readonly DataTableColumn<TRow>[];
    rows?: readonly TRow[];
    getRowId: (row: TRow, index: number) => string;
    mode?: DataTableMode;
    fetchRows?: (args: FetchRowsArgs) => Promise<FetchRowsResult<TRow>>;
    pageSize?: number;
    multiSort?: boolean;
    selectable?: boolean;
    label?: string;
    emptyLabel?: string;
    isRowDisabled?: (row: TRow) => boolean;
    sorting?: SortingState;
    defaultSorting?: SortingState;
    onSortingChange?: (sorting: SortingState) => void;
    selection?: SelectionState;
    defaultSelection?: SelectionState;
    onSelectionChange?: (selection: SelectionState) => void;
    renderCell?: (row: TRow, column: DataTableColumn<TRow>) => ReactNode;
    toolbar?: (table: DataTableController<TRow>) => ReactNode;
    pagination?: boolean;
};

export function DataTable<TRow>(props: DataTableProps<TRow>): ReactElement {
    const {
        columns,
        rows,
        getRowId,
        mode,
        fetchRows,
        pageSize = 10,
        multiSort,
        selectable = true,
        label,
        emptyLabel = "No rows",
        isRowDisabled,
        sorting,
        defaultSorting,
        onSortingChange,
        selection,
        defaultSelection,
        onSelectionChange,
        renderCell,
        toolbar,
        pagination = true,
        ...rest
    } = props;

    const rerender = useRerender();
    const tableRef = useRef<HTMLTableElement | null>(null);
    const [focusedCell, setFocusedCell] = useState<DataTableGridPosition>({ row: 0, column: 0 });
    const onSortingChangeRef = useRef(onSortingChange);
    const onSelectionChangeRef = useRef(onSelectionChange);
    onSortingChangeRef.current = onSortingChange;
    onSelectionChangeRef.current = onSelectionChange;

    const controllerRef = useRef<DataTableController<TRow> | null>(null);
    if (controllerRef.current === null) {
        controllerRef.current = createDataTableController<TRow>({
            columns: [...columns],
            getRowId,
            rows: rows === undefined ? [] : [...rows],
            defaultPagination: { pageIndex: 0, pageSize },
            ...(mode === undefined ? {} : { mode }),
            ...(fetchRows === undefined ? {} : { fetchRows }),
            ...(multiSort === undefined ? {} : { multiSort }),
            ...(isRowDisabled === undefined ? {} : { isRowDisabled }),
            ...(sorting === undefined ? {} : { sorting }),
            ...(defaultSorting === undefined ? {} : { defaultSorting }),
            ...(selection === undefined ? {} : { selection }),
            ...(defaultSelection === undefined ? {} : { defaultSelection }),
            onSortingChange: (next) => onSortingChangeRef.current?.(next),
            onSelectionChange: (next) => onSelectionChangeRef.current?.(next),
        });
    }
    const table = controllerRef.current;

    useEffect(() => {
        return table.subscribe(rerender);
    }, [table, rerender]);

    useEffect(() => {
        if (rows !== undefined) {
            table.setRows([...rows]);
        }
    }, [table, rows]);

    useEffect(() => {
        if (fetchRows !== undefined) {
            void table.load();
        }
    }, [table, fetchRows]);

    useEffect(() => {
        return () => {
            controllerRef.current?.dispose();
            controllerRef.current = null;
        };
    }, []);

    const state = table.getState();
    const visibleColumns = table.getVisibleColumns();
    const pageRows = state.rows;
    const columnCount = visibleColumns.length + (selectable ? 1 : 0);

    const root = useMemo(
        () =>
            resolveDataTable({
                rowCount: pageRows.length,
                columnCount,
                mode: state.mode,
                busy: state.loading,
                selectionCount: table.getSelectedIds().length,
                ...(label === undefined ? {} : { label }),
            }),
        [pageRows.length, columnCount, state.mode, state.loading, label, table],
    );

    const focusCell = (position: DataTableGridPosition): void => {
        setFocusedCell(position);
        const selector = `[data-row-index="${position.row}"][data-column-index="${position.column}"]`;
        const target = tableRef.current?.querySelector(selector);
        if (target instanceof HTMLElement) {
            target.focus();
        }
    };

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLTableElement>): void => {
        rest.onKeyDown?.(event);
        const action = getDataTableKeyboardAction(event.nativeEvent, {
            rowCount: pageRows.length,
            columnCount,
            position: focusedCell,
            pageSize: state.pagination.pageSize,
        });
        if (!action) {
            return;
        }
        if (action.type === "move") {
            event.preventDefault();
            focusCell(action.position);
            return;
        }
        if (action.type === "toggle" && selectable) {
            const row = pageRows[focusedCell.row];
            if (row !== undefined) {
                event.preventDefault();
                table.toggleRowSelected(getRowId(row, focusedCell.row));
            }
        }
    };

    const headerCells: ReactNode[] = visibleColumns.map((column, columnIndex) => {
        const activeSort = state.sorting.find((entry) => entry.id === column.id);
        const header = resolveDataTableHeader({
            columnId: column.id,
            sortable: column.sortable === true,
            sortDirection: activeSort === undefined ? null : activeSort.direction,
            columnIndex: columnIndex + (selectable ? 1 : 0),
        });
        return createElement(
            "th",
            {
                key: column.id,
                className: header.className || undefined,
                style: header.style,
                ...header.attributes,
                ...(column.sortable === true
                    ? {
                          onClick: () => {
                              table.toggleSort(column.id);
                          },
                      }
                    : {}),
            },
            column.sortable === true
                ? createElement(
                      "button",
                      { type: "button", "data-slot": "sort-trigger" },
                      column.header ?? column.id,
                  )
                : (column.header ?? column.id),
        );
    });

    if (selectable) {
        const pageCheckbox = resolveDataTableCheckbox({
            scope: "page",
            pageSelection: table.getPageSelectionState(),
        });
        headerCells.unshift(
            createElement(
                "th",
                { key: "__select", role: "columnheader", "data-slot": "header" },
                createElement("input", {
                    ...withoutBooleanAttributes(pageCheckbox.attributes),
                    checked: pageCheckbox.checked,
                    ref: (element: HTMLInputElement | null) => {
                        if (element) {
                            element.indeterminate = pageCheckbox.indeterminate;
                        }
                    },
                    onChange: () => {
                        table.selectAllPage();
                    },
                }),
            ),
        );
    }

    const bodyRows: ReactNode[] =
        pageRows.length === 0
            ? [
                  createElement(
                      "tr",
                      { key: "__empty", role: "row", "data-slot": "empty" },
                      createElement("td", { colSpan: columnCount, role: "gridcell" }, emptyLabel),
                  ),
              ]
            : pageRows.map((row, rowIndex) => {
                  const rowId = getRowId(row, rowIndex);
                  const disabled = isRowDisabled?.(row) === true;
                  const rowView = resolveDataTableRow({
                      rowId,
                      rowIndex,
                      selected: table.isRowSelected(rowId),
                      ...(disabled ? { disabled } : {}),
                  });
                  const cells: ReactNode[] = visibleColumns.map((column, columnIndex) => {
                      const gridColumn = columnIndex + (selectable ? 1 : 0);
                      const cell = resolveDataTableCell({
                          columnId: column.id,
                          columnIndex: gridColumn,
                          focused:
                              focusedCell.row === rowIndex && focusedCell.column === gridColumn,
                      });
                      const value =
                          column.accessor === undefined ? undefined : column.accessor(row);
                      return createElement(
                          "td",
                          {
                              key: column.id,
                              className: cell.className || undefined,
                              style: cell.style,
                              ...cell.attributes,
                              "data-row-index": rowIndex,
                              "data-column-index": gridColumn,
                              onFocus: () => {
                                  setFocusedCell({ row: rowIndex, column: gridColumn });
                              },
                          },
                          renderCell ? renderCell(row, column) : String(value ?? ""),
                      );
                  });

                  if (selectable) {
                      const rowCheckbox = resolveDataTableCheckbox({
                          scope: "row",
                          checked: table.isRowSelected(rowId),
                          ...(disabled ? { disabled } : {}),
                      });
                      cells.unshift(
                          createElement(
                              "td",
                              {
                                  key: "__select",
                                  role: "gridcell",
                                  "data-slot": "cell",
                                  "data-row-index": rowIndex,
                                  "data-column-index": 0,
                                  tabIndex:
                                      focusedCell.row === rowIndex && focusedCell.column === 0
                                          ? 0
                                          : -1,
                                  onFocus: () => {
                                      setFocusedCell({ row: rowIndex, column: 0 });
                                  },
                              },
                              createElement("input", {
                                  ...withoutBooleanAttributes(rowCheckbox.attributes),
                                  checked: rowCheckbox.checked,
                                  disabled: rowCheckbox.disabled,
                                  onChange: () => {
                                      table.toggleRowSelected(rowId);
                                  },
                              }),
                          ),
                      );
                  }

                  return createElement(
                      "tr",
                      {
                          key: rowId,
                          className: rowView.className || undefined,
                          style: rowView.style,
                          ...rowView.attributes,
                      },
                      cells,
                  );
              });

    const footer = pagination
        ? createElement(
              "div",
              { "data-slot": "pagination" },
              createElement(
                  "button",
                  {
                      type: "button",
                      "data-slot": "first-page",
                      disabled: state.pagination.pageIndex === 0,
                      onClick: () => {
                          table.setPageIndex(0);
                      },
                  },
                  "First",
              ),
              createElement(
                  "button",
                  {
                      type: "button",
                      "data-slot": "previous-page",
                      disabled: state.pagination.pageIndex === 0,
                      onClick: () => {
                          table.setPageIndex(state.pagination.pageIndex - 1);
                      },
                  },
                  "Previous",
              ),
              createElement(
                  "span",
                  { "data-slot": "page-status" },
                  `Page ${state.pagination.pageIndex + 1} of ${state.pageCount}`,
              ),
              createElement(
                  "button",
                  {
                      type: "button",
                      "data-slot": "next-page",
                      disabled:
                          state.pageCount === 0 ||
                          state.pagination.pageIndex >= state.pageCount - 1,
                      onClick: () => {
                          table.setPageIndex(state.pagination.pageIndex + 1);
                      },
                  },
                  "Next",
              ),
              createElement(
                  "button",
                  {
                      type: "button",
                      "data-slot": "last-page",
                      disabled:
                          state.pageCount === 0 ||
                          state.pagination.pageIndex >= state.pageCount - 1,
                      onClick: () => {
                          table.setPageIndex(state.pageCount - 1);
                      },
                  },
                  "Last",
              ),
              createElement(
                  "select",
                  {
                      "data-slot": "page-size",
                      value: state.pagination.pageSize,
                      onChange: (event: ReactChangeEvent<HTMLSelectElement>) => {
                          table.setPageSize(Number(event.currentTarget.value));
                      },
                  },
                  ...[5, 8, 10, 25].map((size) =>
                      createElement("option", { key: size, value: size }, String(size)),
                  ),
              ),
          )
        : null;

    return createElement(
        "div",
        { "data-slot": "data-table" },
        toolbar ? toolbar(table) : null,
        createElement(
            "table",
            {
                ...rest,
                ref: tableRef,
                className: joinClassNames(root.className, rest.className),
                style: { ...root.style, ...rest.style },
                ...root.attributes,
                onKeyDown: handleKeyDown,
            },
            createElement("thead", null, createElement("tr", { role: "row" }, headerCells)),
            createElement("tbody", null, bodyRows),
        ),
        footer,
    );
}

export type UploadDropzoneProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    transport: UploadTransport;
    accept?: string;
    multiple?: boolean;
    maxBytes?: number;
    concurrency?: number;
    disabled?: boolean;
    label?: string;
    onItemsChange?: (items: readonly UploadItem[]) => void;
    children?: ReactNode;
};

export function UploadDropzone(props: UploadDropzoneProps): ReactElement {
    const {
        transport,
        accept,
        multiple = true,
        maxBytes,
        concurrency,
        disabled = false,
        label,
        onItemsChange,
        children,
        ...rest
    } = props;
    const rerender = useRerender();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const onItemsChangeRef = useRef(onItemsChange);
    onItemsChangeRef.current = onItemsChange;

    const uploadRef = useRef<UploadController | null>(null);
    if (uploadRef.current === null) {
        uploadRef.current = createUploadController({
            transport,
            ...(concurrency === undefined ? {} : { concurrency }),
            ...(maxBytes === undefined ? {} : { maxBytes }),
            ...(accept === undefined
                ? {}
                : { accept: accept.split(",").map((rule) => rule.trim()) }),
            onChange: (items) => {
                onItemsChangeRef.current?.(items);
                rerender();
            },
        });
    }
    const upload = uploadRef.current;

    const dropzoneRef = useRef<UploadDropzoneController | null>(null);
    if (dropzoneRef.current === null) {
        dropzoneRef.current = createUploadDropzoneController({
            multiple,
            disabled,
            ...(accept === undefined ? {} : { accept }),
            onFiles: (files) => {
                upload.addFiles(files);
            },
            openFilePicker: () => {
                inputRef.current?.click();
            },
        });
    }
    const dropzone = dropzoneRef.current;

    useEffect(() => {
        dropzone.setDisabled(disabled);
        rerender();
    }, [dropzone, disabled, rerender]);

    useEffect(() => {
        return () => {
            dropzoneRef.current?.dispose();
            uploadRef.current?.dispose();
            dropzoneRef.current = null;
            uploadRef.current = null;
        };
    }, []);

    const view = dropzone.resolve({ ...(label === undefined ? {} : { label }) });

    return createElement(
        "div",
        { "data-slot": "upload" },
        createElement(
            "div",
            {
                ...rest,
                className: joinClassNames(view.className, rest.className),
                style: { ...view.style, ...rest.style },
                ...view.attributes,
                onDragEnter: (event) => {
                    dropzone.handleDragEnter(event.nativeEvent);
                    rerender();
                },
                onDragOver: (event) => {
                    dropzone.handleDragOver(event.nativeEvent);
                },
                onDragLeave: (event) => {
                    dropzone.handleDragLeave(event.nativeEvent);
                    rerender();
                },
                onDrop: (event) => {
                    dropzone.handleDrop(event.nativeEvent);
                    rerender();
                },
                onClick: () => {
                    dropzone.open();
                },
                onKeyDown: (event) => {
                    if (dropzone.handleKeyDown(event.nativeEvent)) {
                        rerender();
                    }
                },
            },
            children ?? "Drop files or press Enter to browse",
        ),
        createElement("input", {
            ref: inputRef,
            type: "file",
            "data-slot": "file-input",
            hidden: true,
            multiple,
            ...(accept === undefined ? {} : { accept }),
            onChange: (event) => {
                dropzone.handleFileList(event.currentTarget.files);
                event.currentTarget.value = "";
            },
        }),
        createElement(UploadList, { items: upload.getItems(), controller: upload }),
    );
}

export type UploadListProps = Omit<HTMLAttributes<HTMLUListElement>, "children"> & {
    items: readonly UploadItem[];
    controller?: UploadController;
    label?: string;
};

export function UploadList(props: UploadListProps): ReactElement {
    const { items, controller, label, ...rest } = props;
    const view = resolveUploadList({
        count: items.length,
        ...(label === undefined ? {} : { label }),
    });
    return createElement(
        "ul",
        {
            ...rest,
            className: joinClassNames(view.className, rest.className),
            style: { ...view.style, ...rest.style },
            ...view.attributes,
        },
        items.map((item) => {
            const itemView = resolveUploadItem({
                id: item.id,
                status: item.status,
                progress: item.progress,
                name: item.file.name,
            });
            return createElement(
                "li",
                {
                    key: item.id,
                    className: itemView.className || undefined,
                    style: itemView.style,
                    ...itemView.attributes,
                },
                createElement("span", { "data-slot": "name" }, item.file.name),
                createElement("span", itemView.progressAttributes, `${itemView.percent}%`),
                controller
                    ? createElement(
                          "button",
                          {
                              type: "button",
                              "data-slot": "cancel",
                              onClick: () => {
                                  if (item.status === "error" || item.status === "canceled") {
                                      controller.retry(item.id);
                                      return;
                                  }
                                  controller.cancel(item.id);
                              },
                          },
                          item.status === "error" || item.status === "canceled"
                              ? "Retry"
                              : "Cancel",
                      )
                    : null,
            );
        }),
    );
}

export type PermissionMatrixProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    resources: readonly PermissionMatrixResource[];
    actions: readonly PermissionMatrixAction[];
    can?: CreatePermissionMatrixControllerOptions["can"];
    value?: PermissionMatrixValue;
    defaultValue?: PermissionMatrixValue;
    onValueChange?: (value: PermissionMatrixValue) => void;
    readOnly?: boolean;
    isCellDisabled?: (resourceId: string, actionId: string) => boolean;
    label?: string;
};

export function PermissionMatrix(props: PermissionMatrixProps): ReactElement {
    const {
        resources,
        actions,
        can,
        value,
        defaultValue,
        onValueChange,
        readOnly = false,
        isCellDisabled,
        label,
        ...rest
    } = props;
    const rerender = useRerender();
    const rootRef = useRef<HTMLDivElement | null>(null);
    const onValueChangeRef = useRef(onValueChange);
    onValueChangeRef.current = onValueChange;

    const controllerRef = useRef<PermissionMatrixController | null>(null);
    if (controllerRef.current === null) {
        controllerRef.current = createPermissionMatrixController({
            resources: [...resources],
            actions: [...actions],
            readOnly,
            ...(can === undefined ? {} : { can }),
            ...(value === undefined ? {} : { value }),
            ...(defaultValue === undefined ? {} : { defaultValue }),
            ...(isCellDisabled === undefined ? {} : { isCellDisabled }),
            onValueChange: (next) => {
                onValueChangeRef.current?.(next);
                rerender();
            },
        });
    }
    const matrix = controllerRef.current;

    useEffect(() => {
        return () => {
            controllerRef.current?.dispose();
            controllerRef.current = null;
        };
    }, []);

    const root = matrix.resolve({ ...(label === undefined ? {} : { label }) });

    const focusCell = (): void => {
        const position = matrix.getFocusedCell();
        const resource = resources[position.row];
        const action = actions[position.column];
        if (!resource || !action) {
            return;
        }
        const target = rootRef.current?.querySelector(
            `[data-resource="${resource.id}"][data-action="${action.id}"]`,
        );
        if (target instanceof HTMLElement) {
            target.focus();
        }
    };

    return createElement(
        "div",
        {
            ...rest,
            ref: rootRef,
            className: joinClassNames(root.className, rest.className),
            style: { ...root.style, ...rest.style },
            ...root.attributes,
            onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => {
                rest.onKeyDown?.(event);
                const action = matrix.getKeyboardAction(event.nativeEvent);
                if (!action) {
                    return;
                }
                event.preventDefault();
                if (action.type === "move") {
                    rerender();
                    focusCell();
                    return;
                }
                const position = matrix.getFocusedCell();
                const resource = resources[position.row];
                const matrixAction = actions[position.column];
                if (resource && matrixAction) {
                    matrix.toggleCell(resource.id, matrixAction.id);
                    rerender();
                }
            },
        },
        createElement(
            "div",
            { role: "row", "data-slot": "header-row" },
            createElement("span", { role: "columnheader", "data-slot": "corner" }, ""),
            actions.map((action) =>
                createElement(
                    "span",
                    { key: action.id, role: "columnheader", "data-slot": "header" },
                    action.label ?? action.id,
                ),
            ),
        ),
        resources.map((resource) =>
            createElement(
                "div",
                { key: resource.id, role: "row", "data-slot": "row" },
                createElement(
                    "span",
                    { role: "rowheader", "data-slot": "row-header" },
                    resource.label ?? resource.id,
                ),
                actions.map((action) => {
                    const cell = matrix.resolveCell(resource.id, action.id);
                    return createElement(
                        "button",
                        {
                            key: action.id,
                            type: "button",
                            className: cell.className || undefined,
                            style: cell.style,
                            ...cell.attributes,
                            disabled: cell.disabled,
                            onClick: () => {
                                matrix.setFocusedCell({
                                    row: resources.indexOf(resource),
                                    column: actions.indexOf(action),
                                });
                                matrix.toggleCell(resource.id, action.id);
                                rerender();
                            },
                        },
                        cell.state,
                    );
                }),
            ),
        ),
    );
}

export type NotificationCenterProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    notifications?: NotificationsController;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    groupBy?: "day" | "source";
    label?: string;
    emptyLabel?: string;
    renderItem?: (item: NotificationItem) => ReactNode;
    children?: (center: NotificationCenterController) => ReactNode;
};

export function NotificationCenter(props: NotificationCenterProps): ReactElement {
    const {
        notifications,
        open,
        defaultOpen = true,
        onOpenChange,
        groupBy,
        label,
        emptyLabel = "No notifications",
        renderItem,
        children,
        ...rest
    } = props;
    const rerender = useRerender();
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;

    const controllerRef = useRef<NotificationCenterController | null>(null);
    if (controllerRef.current === null) {
        controllerRef.current = createNotificationCenterController({
            defaultOpen,
            ...(notifications === undefined ? {} : { notifications }),
            ...(open === undefined ? {} : { open }),
            ...(groupBy === undefined ? {} : { groupBy }),
            onOpenChange: (next) => {
                onOpenChangeRef.current?.(next);
                rerender();
            },
        });
    }
    const center = controllerRef.current;

    useEffect(() => {
        return center.subscribe(rerender);
    }, [center, rerender]);

    useEffect(() => {
        return () => {
            controllerRef.current?.dispose();
            controllerRef.current = null;
        };
    }, []);

    const view = center.resolve({ ...(label === undefined ? {} : { label }) });
    const items = center.getItems();

    return createElement(
        "div",
        {
            ...rest,
            className: joinClassNames(view.className, rest.className),
            style: { ...view.style, ...rest.style },
            ...view.attributes,
        },
        children ? children(center) : null,
        createElement(
            "ul",
            view.listAttributes,
            items.length === 0
                ? createElement("li", { role: "listitem", "data-slot": "empty" }, emptyLabel)
                : items.map((item) => {
                      const itemView = center.resolveItem(item.id);
                      return createElement(
                          "li",
                          {
                              key: item.id,
                              className: itemView.className || undefined,
                              style: itemView.style,
                              ...itemView.attributes,
                          },
                          renderItem
                              ? renderItem(item)
                              : createElement(
                                    "button",
                                    {
                                        type: "button",
                                        "data-slot": "read-trigger",
                                        onClick: () => {
                                            center.markRead(item.id);
                                        },
                                    },
                                    item.title,
                                ),
                          createElement(
                              "button",
                              {
                                  ...itemView.dismissAttributes,
                                  onClick: () => {
                                      center.dismiss(item.id);
                                  },
                              },
                              "×",
                          ),
                      );
                  }),
        ),
    );
}

export type SchemaFormProps = Omit<HTMLAttributes<HTMLFormElement>, "children" | "onSubmit"> & {
    fields: readonly SchemaFieldDescriptor[];
    defaultValues?: SchemaFormValues;
    onSubmitValues?: (values: SchemaFormValues) => void | Promise<void>;
    submitLabel?: string;
    children?: (form: SchemaFormController) => ReactNode;
};

export function SchemaForm(props: SchemaFormProps): ReactElement {
    const {
        fields,
        defaultValues,
        onSubmitValues,
        submitLabel = "Submit",
        children,
        ...rest
    } = props;
    const rerender = useRerender();
    const onSubmitValuesRef = useRef(onSubmitValues);
    onSubmitValuesRef.current = onSubmitValues;

    const formRef = useRef<SchemaFormController | null>(null);
    if (formRef.current === null) {
        formRef.current = createSchemaForm({
            fields: [...fields],
            ...(defaultValues === undefined ? {} : { defaultValues }),
        });
    }
    const form = formRef.current;

    useEffect(() => {
        return form.subscribe(rerender);
    }, [form, rerender]);

    useEffect(() => {
        form.setFields([...fields]);
        rerender();
    }, [form, fields, rerender]);

    useEffect(() => {
        return () => {
            formRef.current?.dispose();
            formRef.current = null;
        };
    }, []);

    const submit = form.handleSubmit({
        onValid: async (values: SchemaFormValues) => {
            await onSubmitValuesRef.current?.(values);
        },
    });

    return createElement(
        "form",
        {
            ...rest,
            noValidate: true,
            onSubmit: (event) => {
                void submit(event);
            },
        },
        children
            ? children(form)
            : form.getFields().map((field: SchemaFieldDescriptor) => {
                  const registration = form.registerField(field.name);
                  const meta = form.getFieldMeta(field.name);
                  return createElement(
                      "label",
                      { key: field.name, "data-slot": "field", "data-invalid": meta.invalid },
                      createElement("span", { "data-slot": "label" }, field.label ?? field.name),
                      createElement("input", {
                          name: field.name,
                          type: field.type === "checkbox" ? "checkbox" : (field.type ?? "text"),
                          disabled: registration.disabled,
                          required: field.required === true,
                          ...(field.placeholder === undefined
                              ? {}
                              : { placeholder: field.placeholder }),
                          ...(field.type === "checkbox"
                              ? { checked: registration.value === true }
                              : { value: String(registration.value ?? "") }),
                          ...(meta.invalid ? { "aria-invalid": true } : {}),
                          onChange: (event) => {
                              registration.onChange(
                                  field.type === "checkbox"
                                      ? event.currentTarget.checked
                                      : event.currentTarget.value,
                              );
                          },
                          onBlur: () => {
                              registration.onBlur();
                          },
                      }),
                      meta.error === undefined
                          ? null
                          : createElement("span", { "data-slot": "error" }, meta.error),
                  );
              }),
        createElement("button", { type: "submit", "data-slot": "submit" }, submitLabel),
    );
}

export {
    createDataTableController,
    createNotificationCenterController,
    createPermissionMatrixController,
    createSchemaForm,
    createUploadController,
    createUploadDropzoneController,
};
export type {
    DataTableColumn,
    DataTableController,
    NotificationCenterController,
    NotificationItem,
    PermissionMatrixAction,
    PermissionMatrixController,
    PermissionMatrixResource,
    PermissionMatrixValue,
    SchemaFieldDescriptor,
    SchemaFormController,
    SchemaFormValues,
    UploadController,
    UploadItem,
    UploadTransport,
};
