# Test scenarios

Run each scenario against the **included synthetic demo only**. Keep Codespaces port 6080 Private. Each test begins at `http://demo:8080` inside remote Chrome. In the FluxGate popup use **Request URL contains** `/api/products`.

| ID | JSON path | Replacement type/value | Expected UI or JSON | Status |
| --- | --- | --- | --- | --- |
| FG-01 | `products[0].name` | `Blank` | `"name": ""` and empty displayed product name | Preset available; not separately evidenced in screenshots |
| FG-02 | `products[0].name` | `Boolean` / `true` | `"name": true`; UI displays `true` | **Observed working in Codespaces** |
| FG-03 | `products[0].price` | `Number` / `0` | `"price": 0` | Suggested next manual test |
| FG-04 | `products[0].name` | `Null` | `"name": null` | Suggested next manual test |
| FG-05 | `products[0].name` | `String` / `Changed by FluxGate` | New string appears in UI | Suggested next manual test |
| FG-06 | `products[0].name` | `Boolean` / `true`, one-shot enabled | First matching fetch modified; subsequent fetch original | One-shot completion observed; subsequent fetch still needs explicit confirmation |
| FG-07 | `products[0].name` | Any valid value, click **Stop** | Subsequent fetch returns original value | Suggested next manual test |
| FG-08 | `products[0].missing` | Any valid value | Original response unchanged; missing JSON property is not created | Covered by unit-level path validation |

## How to run a scenario

1. Ensure the demo initially displays `Sample Notebook`.
2. Open the **FluxGate** extension popup in remote Chrome.
3. Enter the URL fragment, JSON path, replacement type and value from the table.
4. Select **Stop after one successful override** for single-run tests.
5. Click **Start**, return to the page and click **Reload products**.
6. Compare the **Product rendered by UI** section and **Observed JSON** to the table.
7. Click **Stop** when appropriate, then reload to reset. If a one-shot rule automatically stops, you can re-arm it with **Start**.

## Expected limitations

- The demo page only **renders** the first product's `name`. Changes to `price` or `inStock` should be verified in **Observed JSON**.
- A property path must already exist. FluxGate is not a JSON object creation tool.
- It intercepts matching JSON GET responses in the active tab, not arbitrary traffic from all tabs.
- The extension's **Value** field is disabled for the **Blank** and **Null** types.
- Never run these tests against systems you do not own or have authorization to test.
