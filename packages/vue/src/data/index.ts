import {
    defineComponent,
    h,
    onBeforeUnmount,
    ref,
    watch,
    type PropType,
    type Ref,
    type VNode,
} from "vue";
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

function createTick(): { tick: Ref<number>; bump: () => void } {
    const tick = ref(0);
    return {
        tick,
        bump: () => {
            tick.value += 1;
        },
    };
}

export const DataTable = defineComponent({
    name: "SometicDataTable",
    props: {
        columns: {
            type: Array as unknown as PropType<readonly DataTableColumn<Record<string, unknown>>[]>,
            required: true,
        },
        rows: {
            type: Array as unknown as PropType<readonly Record<string, unknown>[]>,
            default: () => [],
        },
        getRowId: {
            type: Function as PropType<(row: Record<string, unknown>, index: number) => string>,
            required: true,
        },
        mode: { type: String as PropType<DataTableMode>, default: undefined },
        fetchRows: {
            type: Function as PropType<
                (args: FetchRowsArgs) => Promise<FetchRowsResult<Record<string, unknown>>>
            >,
            default: undefined,
        },
        pageSize: { type: Number, default: 10 },
        multiSort: { type: Boolean, default: false },
        selectable: { type: Boolean, default: true },
        label: { type: String, default: undefined },
        emptyLabel: { type: String, default: "No rows" },
        pagination: { type: Boolean, default: true },
        defaultSorting: { type: Array as PropType<SortingState>, default: undefined },
    },
    emits: {
        sortingChange: (_sorting: SortingState) => true,
        selectionChange: (_selection: SelectionState) => true,
    },
    setup(props, { emit, attrs }) {
        const { tick, bump } = createTick();
        const focused = ref<DataTableGridPosition>({ row: 0, column: 0 });
        const rootRef = ref<HTMLElement | null>(null);
        const table: DataTableController<Record<string, unknown>> = createDataTableController({
            columns: [...props.columns],
            getRowId: props.getRowId,
            rows: [...props.rows],
            defaultPagination: { pageIndex: 0, pageSize: props.pageSize },
            multiSort: props.multiSort,
            ...(props.mode === undefined ? {} : { mode: props.mode }),
            ...(props.fetchRows === undefined ? {} : { fetchRows: props.fetchRows }),
            ...(props.defaultSorting === undefined ? {} : { defaultSorting: props.defaultSorting }),
            onSortingChange: (sorting) => emit("sortingChange", sorting),
            onSelectionChange: (selection) => emit("selectionChange", selection),
        });

        const unsubscribe = table.subscribe(bump);
        watch(
            () => props.rows,
            (next) => {
                table.setRows([...next]);
            },
        );
        if (props.fetchRows !== undefined) {
            void table.load();
        }
        onBeforeUnmount(() => {
            unsubscribe();
            table.dispose();
        });

        const focusCell = (position: DataTableGridPosition): void => {
            focused.value = position;
            const target = rootRef.value?.querySelector(
                `[data-row-index="${position.row}"][data-column-index="${position.column}"]`,
            );
            if (target instanceof HTMLElement) {
                target.focus();
            }
        };

        return () => {
            void tick.value;
            const state = table.getState();
            const visibleColumns = table.getVisibleColumns();
            const pageRows = state.rows;
            const columnCount = visibleColumns.length + (props.selectable ? 1 : 0);
            const root = resolveDataTable({
                rowCount: pageRows.length,
                columnCount,
                mode: state.mode,
                busy: state.loading,
                selectionCount: table.getSelectedIds().length,
                ...(props.label === undefined ? {} : { label: props.label }),
            });

            const headerCells: VNode[] = visibleColumns.map((column, columnIndex) => {
                const activeSort = state.sorting.find((entry) => entry.id === column.id);
                const header = resolveDataTableHeader({
                    columnId: column.id,
                    sortable: column.sortable === true,
                    sortDirection: activeSort === undefined ? null : activeSort.direction,
                    columnIndex: columnIndex + (props.selectable ? 1 : 0),
                });
                return h(
                    "th",
                    {
                        key: column.id,
                        class: header.className || undefined,
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
                    column.header ?? column.id,
                );
            });

            if (props.selectable) {
                const pageCheckbox = resolveDataTableCheckbox({
                    scope: "page",
                    pageSelection: table.getPageSelectionState(),
                });
                headerCells.unshift(
                    h("th", { key: "__select", role: "columnheader", "data-slot": "header" }, [
                        h("input", {
                            ...withoutBooleanAttributes(pageCheckbox.attributes),
                            checked: pageCheckbox.checked,
                            indeterminate: pageCheckbox.indeterminate,
                            onChange: () => {
                                table.selectAllPage();
                            },
                        }),
                    ]),
                );
            }

            const bodyRows: VNode[] =
                pageRows.length === 0
                    ? [
                          h("tr", { key: "__empty", role: "row", "data-slot": "empty" }, [
                              h("td", { colspan: columnCount, role: "gridcell" }, props.emptyLabel),
                          ]),
                      ]
                    : pageRows.map((row, rowIndex) => {
                          const rowId = props.getRowId(row, rowIndex);
                          const rowView = resolveDataTableRow({
                              rowId,
                              rowIndex,
                              selected: table.isRowSelected(rowId),
                          });
                          const cells: VNode[] = visibleColumns.map((column, columnIndex) => {
                              const gridColumn = columnIndex + (props.selectable ? 1 : 0);
                              const cell = resolveDataTableCell({
                                  columnId: column.id,
                                  columnIndex: gridColumn,
                                  focused:
                                      focused.value.row === rowIndex &&
                                      focused.value.column === gridColumn,
                              });
                              const value =
                                  column.accessor === undefined ? undefined : column.accessor(row);
                              return h(
                                  "td",
                                  {
                                      key: column.id,
                                      class: cell.className || undefined,
                                      style: cell.style,
                                      ...cell.attributes,
                                      "data-row-index": rowIndex,
                                      "data-column-index": gridColumn,
                                      onFocus: () => {
                                          focused.value = { row: rowIndex, column: gridColumn };
                                      },
                                  },
                                  String(value ?? ""),
                              );
                          });

                          if (props.selectable) {
                              const rowCheckbox = resolveDataTableCheckbox({
                                  scope: "row",
                                  checked: table.isRowSelected(rowId),
                              });
                              cells.unshift(
                                  h(
                                      "td",
                                      {
                                          key: "__select",
                                          role: "gridcell",
                                          "data-slot": "cell",
                                          "data-row-index": rowIndex,
                                          "data-column-index": 0,
                                      },
                                      [
                                          h("input", {
                                              ...withoutBooleanAttributes(rowCheckbox.attributes),
                                              checked: rowCheckbox.checked,
                                              onChange: () => {
                                                  table.toggleRowSelected(rowId);
                                              },
                                          }),
                                      ],
                                  ),
                              );
                          }

                          return h(
                              "tr",
                              {
                                  key: rowId,
                                  class: rowView.className || undefined,
                                  style: rowView.style,
                                  ...rowView.attributes,
                              },
                              cells,
                          );
                      });

            const children: VNode[] = [
                h(
                    "table",
                    {
                        ...attrs,
                        ref: rootRef,
                        class: root.className || undefined,
                        style: root.style,
                        ...root.attributes,
                        onKeydown: (event: KeyboardEvent) => {
                            const action = getDataTableKeyboardAction(event, {
                                rowCount: pageRows.length,
                                columnCount,
                                position: focused.value,
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
                            if (action.type === "toggle" && props.selectable) {
                                const row = pageRows[focused.value.row];
                                if (row !== undefined) {
                                    event.preventDefault();
                                    table.toggleRowSelected(props.getRowId(row, focused.value.row));
                                }
                            }
                        },
                    },
                    [h("thead", [h("tr", { role: "row" }, headerCells)]), h("tbody", bodyRows)],
                ),
            ];

            if (props.pagination) {
                children.push(
                    h("div", { "data-slot": "pagination" }, [
                        h(
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
                        h(
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
                        h(
                            "span",
                            { "data-slot": "page-status" },
                            `Page ${state.pagination.pageIndex + 1} of ${state.pageCount}`,
                        ),
                        h(
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
                        h(
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
                        h(
                            "select",
                            {
                                "data-slot": "page-size",
                                value: state.pagination.pageSize,
                                onChange: (event: Event) => {
                                    const target = event.target;
                                    if (target instanceof HTMLSelectElement) {
                                        table.setPageSize(Number(target.value));
                                    }
                                },
                            },
                            [5, 8, 10, 25].map((size) =>
                                h("option", { key: size, value: size }, String(size)),
                            ),
                        ),
                    ]),
                );
            }

            return h("div", { "data-slot": "data-table" }, children);
        };
    },
});

export const UploadList = defineComponent({
    name: "SometicUploadList",
    props: {
        items: { type: Array as PropType<readonly UploadItem[]>, required: true },
        controller: { type: Object as PropType<UploadController>, default: undefined },
        label: { type: String, default: undefined },
    },
    setup(props) {
        return () => {
            const view = resolveUploadList({
                count: props.items.length,
                ...(props.label === undefined ? {} : { label: props.label }),
            });
            return h(
                "ul",
                { class: view.className || undefined, style: view.style, ...view.attributes },
                props.items.map((item) => {
                    const itemView = resolveUploadItem({
                        id: item.id,
                        status: item.status,
                        progress: item.progress,
                        name: item.file.name,
                    });
                    const children: VNode[] = [
                        h("span", { "data-slot": "name" }, item.file.name),
                        h("span", itemView.progressAttributes, `${itemView.percent}%`),
                    ];
                    const controller = props.controller;
                    if (controller) {
                        const retryable = item.status === "error" || item.status === "canceled";
                        children.push(
                            h(
                                "button",
                                {
                                    type: "button",
                                    "data-slot": retryable ? "retry" : "cancel",
                                    onClick: () => {
                                        if (retryable) {
                                            controller.retry(item.id);
                                            return;
                                        }
                                        controller.cancel(item.id);
                                    },
                                },
                                retryable ? "Retry" : "Cancel",
                            ),
                        );
                    }
                    return h(
                        "li",
                        {
                            key: item.id,
                            class: itemView.className || undefined,
                            style: itemView.style,
                            ...itemView.attributes,
                        },
                        children,
                    );
                }),
            );
        };
    },
});

export const UploadDropzone = defineComponent({
    name: "SometicUploadDropzone",
    props: {
        transport: { type: Object as PropType<UploadTransport>, required: true },
        accept: { type: String, default: undefined },
        multiple: { type: Boolean, default: true },
        maxBytes: { type: Number, default: undefined },
        concurrency: { type: Number, default: undefined },
        disabled: { type: Boolean, default: false },
        label: { type: String, default: undefined },
    },
    emits: {
        itemsChange: (_items: readonly UploadItem[]) => true,
    },
    setup(props, { emit, slots }) {
        const { tick, bump } = createTick();
        const inputRef = ref<HTMLInputElement | null>(null);
        const upload: UploadController = createUploadController({
            transport: props.transport,
            ...(props.concurrency === undefined ? {} : { concurrency: props.concurrency }),
            ...(props.maxBytes === undefined ? {} : { maxBytes: props.maxBytes }),
            ...(props.accept === undefined
                ? {}
                : { accept: props.accept.split(",").map((rule) => rule.trim()) }),
            onChange: (items) => {
                emit("itemsChange", items);
                bump();
            },
        });
        const dropzone: UploadDropzoneController = createUploadDropzoneController({
            multiple: props.multiple,
            disabled: props.disabled,
            ...(props.accept === undefined ? {} : { accept: props.accept }),
            onFiles: (files) => {
                upload.addFiles(files);
            },
            openFilePicker: () => {
                inputRef.value?.click();
            },
        });

        watch(
            () => props.disabled,
            (next) => {
                dropzone.setDisabled(next);
                bump();
            },
        );
        onBeforeUnmount(() => {
            dropzone.dispose();
            upload.dispose();
        });

        return () => {
            void tick.value;
            const view = dropzone.resolve({
                ...(props.label === undefined ? {} : { label: props.label }),
            });
            return h("div", { "data-slot": "upload" }, [
                h(
                    "div",
                    {
                        class: view.className || undefined,
                        style: view.style,
                        ...view.attributes,
                        onDragenter: (event: DragEvent) => {
                            dropzone.handleDragEnter(event);
                            bump();
                        },
                        onDragover: (event: DragEvent) => {
                            dropzone.handleDragOver(event);
                        },
                        onDragleave: (event: DragEvent) => {
                            dropzone.handleDragLeave(event);
                            bump();
                        },
                        onDrop: (event: DragEvent) => {
                            dropzone.handleDrop(event);
                            bump();
                        },
                        onClick: () => {
                            dropzone.open();
                        },
                        onKeydown: (event: KeyboardEvent) => {
                            if (dropzone.handleKeyDown(event)) {
                                bump();
                            }
                        },
                    },
                    slots.default?.() ?? "Drop files or press Enter to browse",
                ),
                h("input", {
                    ref: inputRef,
                    type: "file",
                    "data-slot": "file-input",
                    hidden: true,
                    multiple: props.multiple,
                    ...(props.accept === undefined ? {} : { accept: props.accept }),
                    onChange: (event: Event) => {
                        const input = event.target;
                        if (!(input instanceof HTMLInputElement)) {
                            return;
                        }
                        dropzone.handleFileList(input.files);
                        input.value = "";
                    },
                }),
                h(UploadList, { items: upload.getItems(), controller: upload }),
            ]);
        };
    },
});

export const PermissionMatrix = defineComponent({
    name: "SometicPermissionMatrix",
    props: {
        resources: {
            type: Array as PropType<readonly PermissionMatrixResource[]>,
            required: true,
        },
        actions: { type: Array as PropType<readonly PermissionMatrixAction[]>, required: true },
        can: {
            type: Function as PropType<
                (resourceId: string, actionId: string) => boolean | undefined
            >,
            default: undefined,
        },
        defaultValue: {
            type: Object as PropType<PermissionMatrixValue>,
            default: undefined,
        },
        readOnly: { type: Boolean, default: false },
        label: { type: String, default: undefined },
    },
    emits: {
        valueChange: (_value: PermissionMatrixValue) => true,
    },
    setup(props, { emit }) {
        const { tick, bump } = createTick();
        const rootRef = ref<HTMLElement | null>(null);
        const matrix: PermissionMatrixController = createPermissionMatrixController({
            resources: [...props.resources],
            actions: [...props.actions],
            readOnly: props.readOnly,
            ...(props.can === undefined ? {} : { can: props.can }),
            ...(props.defaultValue === undefined ? {} : { defaultValue: props.defaultValue }),
            onValueChange: (value) => {
                emit("valueChange", value);
                bump();
            },
        });

        onBeforeUnmount(() => {
            matrix.dispose();
        });

        const focusCell = (): void => {
            const position = matrix.getFocusedCell();
            const resource = props.resources[position.row];
            const action = props.actions[position.column];
            if (!resource || !action) {
                return;
            }
            const target = rootRef.value?.querySelector(
                `[data-resource="${resource.id}"][data-action="${action.id}"]`,
            );
            if (target instanceof HTMLElement) {
                target.focus();
            }
        };

        return () => {
            void tick.value;
            const root = matrix.resolve({
                ...(props.label === undefined ? {} : { label: props.label }),
            });
            return h(
                "div",
                {
                    ref: rootRef,
                    class: root.className || undefined,
                    style: root.style,
                    ...root.attributes,
                    onKeydown: (event: KeyboardEvent) => {
                        const action = matrix.getKeyboardAction(event);
                        if (!action) {
                            return;
                        }
                        event.preventDefault();
                        if (action.type === "move") {
                            bump();
                            focusCell();
                            return;
                        }
                        const position = matrix.getFocusedCell();
                        const resource = props.resources[position.row];
                        const matrixAction = props.actions[position.column];
                        if (resource && matrixAction) {
                            matrix.toggleCell(resource.id, matrixAction.id);
                            bump();
                        }
                    },
                },
                [
                    h("div", { role: "row", "data-slot": "header-row" }, [
                        h("span", { role: "columnheader", "data-slot": "corner" }, ""),
                        ...props.actions.map((action) =>
                            h(
                                "span",
                                { key: action.id, role: "columnheader", "data-slot": "header" },
                                action.label ?? action.id,
                            ),
                        ),
                    ]),
                    ...props.resources.map((resource) =>
                        h("div", { key: resource.id, role: "row", "data-slot": "row" }, [
                            h(
                                "span",
                                { role: "rowheader", "data-slot": "row-header" },
                                resource.label ?? resource.id,
                            ),
                            ...props.actions.map((action) => {
                                const cell = matrix.resolveCell(resource.id, action.id);
                                return h(
                                    "button",
                                    {
                                        key: action.id,
                                        type: "button",
                                        class: cell.className || undefined,
                                        style: cell.style,
                                        ...cell.attributes,
                                        disabled: cell.disabled,
                                        onClick: () => {
                                            matrix.setFocusedCell({
                                                row: props.resources.indexOf(resource),
                                                column: props.actions.indexOf(action),
                                            });
                                            matrix.toggleCell(resource.id, action.id);
                                            bump();
                                        },
                                    },
                                    cell.state,
                                );
                            }),
                        ]),
                    ),
                ],
            );
        };
    },
});

export const NotificationCenter = defineComponent({
    name: "SometicNotificationCenter",
    props: {
        notifications: {
            type: Object as PropType<NotificationsController>,
            default: undefined,
        },
        defaultOpen: { type: Boolean, default: true },
        groupBy: { type: String as PropType<"day" | "source">, default: undefined },
        label: { type: String, default: undefined },
        emptyLabel: { type: String, default: "No notifications" },
    },
    emits: {
        openChange: (_open: boolean) => true,
    },
    setup(props, { emit }) {
        const { tick, bump } = createTick();
        const center: NotificationCenterController = createNotificationCenterController({
            defaultOpen: props.defaultOpen,
            ...(props.notifications === undefined ? {} : { notifications: props.notifications }),
            ...(props.groupBy === undefined ? {} : { groupBy: props.groupBy }),
            onOpenChange: (open) => {
                emit("openChange", open);
                bump();
            },
        });
        const unsubscribe = center.subscribe(bump);
        onBeforeUnmount(() => {
            unsubscribe();
            center.dispose();
        });

        return () => {
            void tick.value;
            const view = center.resolve({
                ...(props.label === undefined ? {} : { label: props.label }),
            });
            const items = center.getItems();
            return h(
                "div",
                { class: view.className || undefined, style: view.style, ...view.attributes },
                [
                    h(
                        "ul",
                        view.listAttributes,
                        items.length === 0
                            ? [
                                  h(
                                      "li",
                                      { role: "listitem", "data-slot": "empty" },
                                      props.emptyLabel,
                                  ),
                              ]
                            : items.map((item: NotificationItem) => {
                                  const itemView = center.resolveItem(item.id);
                                  return h(
                                      "li",
                                      {
                                          key: item.id,
                                          class: itemView.className || undefined,
                                          style: itemView.style,
                                          ...itemView.attributes,
                                      },
                                      [
                                          h(
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
                                          h(
                                              "button",
                                              {
                                                  ...itemView.dismissAttributes,
                                                  onClick: () => {
                                                      center.dismiss(item.id);
                                                  },
                                              },
                                              "×",
                                          ),
                                      ],
                                  );
                              }),
                    ),
                ],
            );
        };
    },
});

export const SchemaForm = defineComponent({
    name: "SometicSchemaForm",
    props: {
        fields: { type: Array as PropType<readonly SchemaFieldDescriptor[]>, required: true },
        defaultValues: { type: Object as PropType<SchemaFormValues>, default: undefined },
        submitLabel: { type: String, default: "Submit" },
    },
    emits: {
        submitValues: (_values: SchemaFormValues) => true,
    },
    setup(props, { emit }) {
        const { tick, bump } = createTick();
        const form: SchemaFormController = createSchemaForm({
            fields: [...props.fields],
            ...(props.defaultValues === undefined ? {} : { defaultValues: props.defaultValues }),
        });
        const unsubscribe = form.subscribe(bump);
        watch(
            () => props.fields,
            (next) => {
                form.setFields([...next]);
                bump();
            },
        );
        onBeforeUnmount(() => {
            unsubscribe();
            form.dispose();
        });

        const submit = form.handleSubmit({
            onValid: (values) => {
                emit("submitValues", values);
            },
        });

        return () => {
            void tick.value;
            return h(
                "form",
                {
                    novalidate: true,
                    onSubmit: (event: Event) => {
                        void submit(event);
                    },
                },
                [
                    ...form.getFields().map((field) => {
                        const registration = form.registerField(field.name);
                        const meta = form.getFieldMeta(field.name);
                        const children: VNode[] = [
                            h("span", { "data-slot": "label" }, field.label ?? field.name),
                            h("input", {
                                name: field.name,
                                type:
                                    field.type === "checkbox" ? "checkbox" : (field.type ?? "text"),
                                disabled: registration.disabled,
                                required: field.required === true,
                                ...(field.placeholder === undefined
                                    ? {}
                                    : { placeholder: field.placeholder }),
                                ...(field.type === "checkbox"
                                    ? { checked: registration.value === true }
                                    : { value: String(registration.value ?? "") }),
                                ...(meta.invalid ? { "aria-invalid": "true" } : {}),
                                onInput: (event: Event) => {
                                    const input = event.target;
                                    if (!(input instanceof HTMLInputElement)) {
                                        return;
                                    }
                                    registration.onChange(
                                        field.type === "checkbox" ? input.checked : input.value,
                                    );
                                },
                                onBlur: () => {
                                    registration.onBlur();
                                },
                            }),
                        ];
                        if (meta.error !== undefined) {
                            children.push(h("span", { "data-slot": "error" }, meta.error));
                        }
                        return h(
                            "label",
                            {
                                key: field.name,
                                "data-slot": "field",
                                "data-invalid": meta.invalid ? "true" : "false",
                            },
                            children,
                        );
                    }),
                    h("button", { type: "submit", "data-slot": "submit" }, props.submitLabel),
                ],
            );
        };
    },
});
