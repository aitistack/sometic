import fs from "node:fs";
import path from "node:path";

const root = path.resolve("apps/docs/components");

const map = {
    "button.md": "PreviewButton",
    "icon-button.md": "PreviewIconButton",
    "button-group.md": "PreviewButtonGroup",
    "toggle-button.md": "PreviewToggleButton",
    "async-button.md": "PreviewAsyncButton",
    "input.md": "PreviewInput",
    "field.md": "PreviewField",
    "form.md": "PreviewForm",
    "password-input.md": "PreviewPassword",
    "otp-input.md": "PreviewOtp",
    "number-input.md": "PreviewNumber",
    "file-input.md": "PreviewFile",
    "masked-input.md": "PreviewMasked",
    "currency-input.md": "PreviewCurrency",
    "date-input.md": "PreviewDate",
    "checkbox.md": "PreviewCheckbox",
    "switch.md": "PreviewSwitch",
    "radio.md": "PreviewRadio",
    "select.md": "PreviewSelect",
    "dialog.md": "PreviewDialog",
    "popover.md": "PreviewPopover",
    "tooltip.md": "PreviewTooltip",
    "toast.md": "PreviewToast",
    "alert.md": "PreviewAlert",
};

/** @type {Record<string, { js: string; ts: string }>} */
const snippets = {
    "button.md": {
        js: `import { Button } from "@sometic/react/button";

export function Example() {
  return <Button onClick={() => {}}>Save</Button>;
}`,
        ts: `import { Button } from "@sometic/react/button";

export function Example(): JSX.Element {
  return <Button onClick={() => {}}>Save</Button>;
}`,
    },
    "icon-button.md": {
        js: `import { IconButton } from "@sometic/react/button";

export function Example() {
  return <IconButton aria-label="Search" />;
}`,
        ts: `import { IconButton } from "@sometic/react/button";

export function Example(): JSX.Element {
  return <IconButton aria-label="Search" />;
}`,
    },
    "button-group.md": {
        js: `import { Button, ButtonGroup } from "@sometic/react/button";

export function Example() {
  return (
    <ButtonGroup aria-label="Export">
      <Button>CSV</Button>
      <Button>JSON</Button>
    </ButtonGroup>
  );
}`,
        ts: `import { Button, ButtonGroup } from "@sometic/react/button";

export function Example(): JSX.Element {
  return (
    <ButtonGroup aria-label="Export">
      <Button>CSV</Button>
      <Button>JSON</Button>
    </ButtonGroup>
  );
}`,
    },
    "toggle-button.md": {
        js: `import { useState } from "react";
import { ToggleButton } from "@sometic/react/button";

export function Example() {
  const [pressed, setPressed] = useState(false);
  return (
    <ToggleButton pressed={pressed} onPressedChange={setPressed}>
      Bold
    </ToggleButton>
  );
}`,
        ts: `import { useState } from "react";
import { ToggleButton } from "@sometic/react/button";

export function Example(): JSX.Element {
  const [pressed, setPressed] = useState(false);
  return (
    <ToggleButton pressed={pressed} onPressedChange={setPressed}>
      Bold
    </ToggleButton>
  );
}`,
    },
    "async-button.md": {
        js: `import { AsyncButton } from "@sometic/react/button";

export function Example() {
  return (
    <AsyncButton
      action={async ({ signal }) => {
        await fetch("/api/save", { signal });
      }}
    >
      Save
    </AsyncButton>
  );
}`,
        ts: `import { AsyncButton } from "@sometic/react/button";

export function Example(): JSX.Element {
  return (
    <AsyncButton
      action={async ({ signal }) => {
        await fetch("/api/save", { signal });
      }}
    >
      Save
    </AsyncButton>
  );
}`,
    },
    "input.md": {
        js: `import { useState } from "react";
import { Input } from "@sometic/react/input";

export function Example() {
  const [value, setValue] = useState("");
  return <Input value={value} onValueChange={setValue} placeholder="Name" />;
}`,
        ts: `import { useState } from "react";
import { Input } from "@sometic/react/input";

export function Example(): JSX.Element {
  const [value, setValue] = useState("");
  return <Input value={value} onValueChange={setValue} placeholder="Name" />;
}`,
    },
    "field.md": {
        js: `import { Field } from "@sometic/react/field";
import { Input } from "@sometic/react/input";

export function Example() {
  return (
    <Field label="Email" description="Work address">
      <Input type="email" />
    </Field>
  );
}`,
        ts: `import { Field } from "@sometic/react/field";
import { Input } from "@sometic/react/input";

export function Example(): JSX.Element {
  return (
    <Field label="Email" description="Work address">
      <Input type="email" />
    </Field>
  );
}`,
    },
    "form.md": {
        js: `import { useForm, Form } from "@sometic/react/form";

export function Example() {
  const form = useForm({ defaultValues: { email: "" } });
  return (
    <Form form={form} onSubmit={async (values) => console.log(values)}>
      <input name="email" />
      <button type="submit">Send</button>
    </Form>
  );
}`,
        ts: `import { useForm, Form } from "@sometic/react/form";

export function Example(): JSX.Element {
  const form = useForm({ defaultValues: { email: "" } });
  return (
    <Form form={form} onSubmit={async (values) => console.log(values)}>
      <input name="email" />
      <button type="submit">Send</button>
    </Form>
  );
}`,
    },
    "password-input.md": {
        js: `import { PasswordInput } from "@sometic/react/input";

export function Example() {
  return <PasswordInput defaultValue="" />;
}`,
        ts: `import { PasswordInput } from "@sometic/react/input";

export function Example(): JSX.Element {
  return <PasswordInput defaultValue="" />;
}`,
    },
    "otp-input.md": {
        js: `import { OtpInput } from "@sometic/react/input";

export function Example() {
  return <OtpInput length={6} onComplete={(code) => console.log(code)} />;
}`,
        ts: `import { OtpInput } from "@sometic/react/input";

export function Example(): JSX.Element {
  return <OtpInput length={6} onComplete={(code) => console.log(code)} />;
}`,
    },
    "number-input.md": {
        js: `import { useState } from "react";
import { NumberInput } from "@sometic/react/input";

export function Example() {
  const [value, setValue] = useState(null);
  return <NumberInput value={value} onValueChange={setValue} />;
}`,
        ts: `import { useState } from "react";
import { NumberInput } from "@sometic/react/input";

export function Example(): JSX.Element {
  const [value, setValue] = useState(null);
  return <NumberInput value={value} onValueChange={setValue} />;
}`,
    },
    "file-input.md": {
        js: `import { FileInput } from "@sometic/react/input";

export function Example() {
  return <FileInput onValueChange={(files) => console.log(files)} />;
}`,
        ts: `import { FileInput } from "@sometic/react/input";

export function Example(): JSX.Element {
  return <FileInput onValueChange={(files) => console.log(files)} />;
}`,
    },
    "masked-input.md": {
        js: `import { MaskedInput } from "@sometic/react/input";

export function Example() {
  return <MaskedInput mask="(###) ###-####" />;
}`,
        ts: `import { MaskedInput } from "@sometic/react/input";

export function Example(): JSX.Element {
  return <MaskedInput mask="(###) ###-####" />;
}`,
    },
    "currency-input.md": {
        js: `import { CurrencyInput } from "@sometic/react/input";

export function Example() {
  return <CurrencyInput currency="USD" locale="en-US" />;
}`,
        ts: `import { CurrencyInput } from "@sometic/react/input";

export function Example(): JSX.Element {
  return <CurrencyInput currency="USD" locale="en-US" />;
}`,
    },
    "date-input.md": {
        js: `import { DateInput } from "@sometic/react/input";

export function Example() {
  return <DateInput />;
}`,
        ts: `import { DateInput } from "@sometic/react/input";

export function Example(): JSX.Element {
  return <DateInput />;
}`,
    },
    "checkbox.md": {
        js: `import { useState } from "react";
import { Checkbox } from "@sometic/react/selection";

export function Example() {
  const [checked, setChecked] = useState(false);
  return <Checkbox checked={checked} onCheckedChange={setChecked} />;
}`,
        ts: `import { useState } from "react";
import { Checkbox } from "@sometic/react/selection";

export function Example(): JSX.Element {
  const [checked, setChecked] = useState(false);
  return <Checkbox checked={checked} onCheckedChange={setChecked} />;
}`,
    },
    "switch.md": {
        js: `import { useState } from "react";
import { Switch } from "@sometic/react/selection";

export function Example() {
  const [checked, setChecked] = useState(true);
  return <Switch checked={checked} onCheckedChange={setChecked} />;
}`,
        ts: `import { useState } from "react";
import { Switch } from "@sometic/react/selection";

export function Example(): JSX.Element {
  const [checked, setChecked] = useState(true);
  return <Switch checked={checked} onCheckedChange={setChecked} />;
}`,
    },
    "radio.md": {
        js: `import { useState } from "react";
import { Radio, RadioGroup } from "@sometic/react/selection";

export function Example() {
  const [value, setValue] = useState("pro");
  return (
    <RadioGroup value={value} onValueChange={setValue}>
      <Radio value="free" />
      <Radio value="pro" />
    </RadioGroup>
  );
}`,
        ts: `import { useState } from "react";
import { Radio, RadioGroup } from "@sometic/react/selection";

export function Example(): JSX.Element {
  const [value, setValue] = useState("pro");
  return (
    <RadioGroup value={value} onValueChange={setValue}>
      <Radio value="free" />
      <Radio value="pro" />
    </RadioGroup>
  );
}`,
    },
    "select.md": {
        js: `import { useState } from "react";
import { Select } from "@sometic/react/selection";

export function Example() {
  const [value, setValue] = useState("us");
  return (
    <Select value={value} onValueChange={setValue}>
      <option value="us">United States</option>
      <option value="ca">Canada</option>
    </Select>
  );
}`,
        ts: `import { useState } from "react";
import { Select } from "@sometic/react/selection";

export function Example(): JSX.Element {
  const [value, setValue] = useState("us");
  return (
    <Select value={value} onValueChange={setValue}>
      <option value="us">United States</option>
      <option value="ca">Canada</option>
    </Select>
  );
}`,
    },
    "dialog.md": {
        js: `import { useState } from "react";
import { Dialog } from "@sometic/react/overlay";

export function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open</button>
      <Dialog open={open} onOpenChange={setOpen}>Confirm?</Dialog>
    </>
  );
}`,
        ts: `import { useState } from "react";
import { Dialog } from "@sometic/react/overlay";

export function Example(): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open</button>
      <Dialog open={open} onOpenChange={setOpen}>Confirm?</Dialog>
    </>
  );
}`,
    },
    "popover.md": {
        js: `import { Popover } from "@sometic/react/overlay";

export function Example() {
  return <Popover open>Menu content</Popover>;
}`,
        ts: `import { Popover } from "@sometic/react/overlay";

export function Example(): JSX.Element {
  return <Popover open>Menu content</Popover>;
}`,
    },
    "tooltip.md": {
        js: `import { Tooltip } from "@sometic/react/overlay";

export function Example() {
  return (
    <Tooltip open label="Shortcut">
      <button type="button">Hint</button>
    </Tooltip>
  );
}`,
        ts: `import { Tooltip } from "@sometic/react/overlay";

export function Example(): JSX.Element {
  return (
    <Tooltip open label="Shortcut">
      <button type="button">Hint</button>
    </Tooltip>
  );
}`,
    },
    "toast.md": {
        js: `import { ToastRegion } from "@sometic/react/overlay";

export function Example() {
  return (
    <ToastRegion>
      {({ push }) => (
        <button type="button" onClick={() => push({ title: "Saved" })}>
          Toast
        </button>
      )}
    </ToastRegion>
  );
}`,
        ts: `import { ToastRegion } from "@sometic/react/overlay";

export function Example(): JSX.Element {
  return (
    <ToastRegion>
      {({ push }) => (
        <button type="button" onClick={() => push({ title: "Saved" })}>
          Toast
        </button>
      )}
    </ToastRegion>
  );
}`,
    },
    "alert.md": {
        js: `import { Alert } from "@sometic/react/overlay";

export function Example() {
  return <Alert tone="info">Something happened</Alert>;
}`,
        ts: `import { Alert } from "@sometic/react/overlay";

export function Example(): JSX.Element {
  return <Alert tone="info">Something happened</Alert>;
}`,
    },
};

for (const [file, preview] of Object.entries(map)) {
    const full = path.join(root, file);
    let text = fs.readFileSync(full, "utf8");
    if (text.includes(`<${preview}`)) {
        console.log("skip", file);
        continue;
    }
    const snip = snippets[file];
    if (!snip) {
        console.error("missing snippet", file);
        continue;
    }
    const lines = text.split("\n");
    if (!lines[0]?.startsWith("# ")) {
        console.error("bad title", file);
        continue;
    }
    let insertAt = 1;
    while (insertAt < lines.length && lines[insertAt].trim() === "") {
        insertAt += 1;
    }
    while (insertAt < lines.length && lines[insertAt].trim() !== "") {
        insertAt += 1;
    }
    while (insertAt < lines.length && lines[insertAt].trim() === "") {
        insertAt += 1;
    }
    const block = [
        `<${preview} />`,
        "",
        "## Usage",
        "",
        "::: code-group",
        "",
        "```tsx [JS]",
        snip.js,
        "```",
        "",
        "```tsx [TS]",
        snip.ts,
        "```",
        "",
        ":::",
        "",
    ];
    lines.splice(insertAt, 0, ...block);
    fs.writeFileSync(full, lines.join("\n"));
    console.log("updated", file);
}
