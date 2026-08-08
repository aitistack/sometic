import { defineAsyncComponent, type Component } from "vue";

type Loader = () => Promise<{ default: Component }>;

const loaders: Record<string, Loader> = {
    PreviewButton: () => import("./PreviewButton.vue"),
    PreviewIconButton: () => import("./PreviewIconButton.vue"),
    PreviewButtonGroup: () => import("./PreviewButtonGroup.vue"),
    PreviewToggleButton: () => import("./PreviewToggleButton.vue"),
    PreviewAsyncButton: () => import("./PreviewAsyncButton.vue"),
    PreviewInput: () => import("./PreviewInput.vue"),
    PreviewField: () => import("./PreviewField.vue"),
    PreviewPassword: () => import("./PreviewPassword.vue"),
    PreviewOtp: () => import("./PreviewOtp.vue"),
    PreviewNumber: () => import("./PreviewNumber.vue"),
    PreviewFile: () => import("./PreviewFile.vue"),
    PreviewMasked: () => import("./PreviewMasked.vue"),
    PreviewCurrency: () => import("./PreviewCurrency.vue"),
    PreviewDate: () => import("./PreviewDate.vue"),
    PreviewCheckbox: () => import("./PreviewCheckbox.vue"),
    PreviewSwitch: () => import("./PreviewSwitch.vue"),
    PreviewRadio: () => import("./PreviewRadio.vue"),
    PreviewSelect: () => import("./PreviewSelect.vue"),
    PreviewDialog: () => import("./PreviewDialog.vue"),
    PreviewDrawer: () => import("./PreviewDrawer.vue"),
    PreviewMenu: () => import("./PreviewMenu.vue"),
    PreviewContextMenu: () => import("./PreviewContextMenu.vue"),
    PreviewPopover: () => import("./PreviewPopover.vue"),
    PreviewTooltip: () => import("./PreviewTooltip.vue"),
    PreviewToast: () => import("./PreviewToast.vue"),
    PreviewAlert: () => import("./PreviewAlert.vue"),
    PreviewTabs: () => import("./PreviewTabs.vue"),
    PreviewAccordion: () => import("./PreviewAccordion.vue"),
    PreviewBreadcrumb: () => import("./PreviewBreadcrumb.vue"),
    PreviewCombobox: () => import("./PreviewCombobox.vue"),
    PreviewProgress: () => import("./PreviewProgress.vue"),
    PreviewSpinner: () => import("./PreviewSpinner.vue"),
    PreviewSkeleton: () => import("./PreviewSkeleton.vue"),
    PreviewBadge: () => import("./PreviewBadge.vue"),
    PreviewForm: () => import("./PreviewForm.vue"),
};

/** Async preview map — keeps the home route free of preview chunk weight. */
export const previewComponents: Record<string, Component> = Object.fromEntries(
    Object.entries(loaders).map(([name, loader]) => [
        name,
        defineAsyncComponent({
            loader,
            delay: 80,
            timeout: 20000,
        }),
    ]),
);
