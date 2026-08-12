import { calculateTotals, lineAmount } from "./calculations";
import { createEmptyDocument } from "./defaults";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const doc = createEmptyDocument("invoice");
doc.items = [
  { id: "1", name: "A", quantity: 2, unit_cost: 50 },
  { id: "2", name: "B", quantity: 1, unit_cost: 25 },
];
doc.discount_mode = "percent";
doc.discount_value = 10;
doc.tax_mode = "percent";
doc.tax_value = 8;
doc.shipping_mode = "flat";
doc.shipping_value = 5;
doc.amount_paid = 20;

assert(lineAmount(doc.items[0]) === 100, "line amount");
const totals = calculateTotals(doc);
assert(totals.subtotal === 125, `subtotal ${totals.subtotal}`);
assert(totals.discount === 12.5, `discount ${totals.discount}`);
assert(totals.tax === 9, `tax ${totals.tax}`);
assert(totals.shipping === 5, `shipping ${totals.shipping}`);
assert(totals.total === 126.5, `total ${totals.total}`);
assert(totals.balanceDue === 106.5, `balance ${totals.balanceDue}`);

console.log("calculations.test.ts passed");
