<script setup lang="ts">
import { computed, ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

type FieldId = "name" | "role";
type OperatorId = "contains" | "equals";
type Rule = { id: string; field: FieldId; operator: OperatorId; value: string };

const fields: Array<{ id: FieldId; label: string }> = [
    { id: "name", label: "Name" },
    { id: "role", label: "Role" },
];

const operators: Array<{ id: OperatorId; label: string }> = [
    { id: "contains", label: "contains" },
    { id: "equals", label: "equals" },
];

const rules = ref<Rule[]>([{ id: "rule-1", field: "name", operator: "contains", value: "Person" }]);
let nextRuleId = 2;

const filters = computed(() =>
    rules.value.map((rule) => ({ id: rule.field, value: rule.value, operator: rule.operator })),
);

const filtersJson = computed(() => JSON.stringify(filters.value, null, 2));

function addRule(): void {
    rules.value = [
        ...rules.value,
        { id: `rule-${nextRuleId}`, field: "role", operator: "equals", value: "Admin" },
    ];
    nextRuleId += 1;
}

function removeRule(ruleId: string): void {
    rules.value = rules.value.filter((rule) => rule.id !== ruleId);
}
</script>

<template>
    <DemoFrame title="Preview" hint="Query builder" stack>
        <div class="pg-query-rules" data-slot="group" data-combinator="and">
            <div v-for="rule in rules" :key="rule.id" class="pg-row" data-slot="rule">
                <select
                    v-model="rule.field"
                    class="pg-input pg-select pg-query-field"
                    :aria-label="`Field for ${rule.id}`"
                >
                    <option v-for="field in fields" :key="field.id" :value="field.id">
                        {{ field.label }}
                    </option>
                </select>
                <select
                    v-model="rule.operator"
                    class="pg-input pg-select pg-query-operator"
                    :aria-label="`Operator for ${rule.id}`"
                >
                    <option v-for="operator in operators" :key="operator.id" :value="operator.id">
                        {{ operator.label }}
                    </option>
                </select>
                <input
                    v-model="rule.value"
                    class="pg-input pg-query-value"
                    type="text"
                    :aria-label="`Value for ${rule.id}`"
                />
                <button type="button" class="pg-btn" @click="removeRule(rule.id)">Remove</button>
            </div>
            <p v-if="rules.length === 0" class="pg-status">No rules. Add one to build a filter.</p>
        </div>
        <div class="pg-row">
            <button type="button" class="pg-btn" @click="addRule">Add rule</button>
        </div>
        <pre class="pg-status">{{ filtersJson }}</pre>
    </DemoFrame>
</template>

<style scoped>
.pg-query-rules {
    display: grid;
    gap: 0.25rem;
}

.pg-query-field,
.pg-query-operator {
    width: auto;
    min-width: 7.5rem;
    flex: 0 0 auto;
}

.pg-query-value {
    width: auto;
    min-width: 9rem;
    flex: 1 1 9rem;
}
</style>
