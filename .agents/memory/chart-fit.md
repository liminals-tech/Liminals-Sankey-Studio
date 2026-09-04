---
name: Responsive chart fit
description: Constraint for keeping the Sankey fully visible across preview and export surfaces.
---

Generated chart dimensions, the live SVG viewBox, and exported SVG viewBox must stay synchronized; frame-specific exports must relayout the chart inside the selected aspect ratio rather than only changing the outer canvas.

Node heights must also use one shared value scale across levels; normalizing each column independently makes middle totals look misleadingly equal to the source total.

Low-cardinality or headcount datasets must not cap the shared scale at 1; otherwise `Value = 1` player nodes stay at their minimum height and tall frames become mostly empty space.

**Why:** A fixed minimum width and a mismatched viewBox can clip either the diagram or its labels, especially on mobile and in narrow editor layouts.

**How to apply:** When changing Sankey margins or dimensions, update model layout bounds, live SVG bounds, and export bounds together, and keep controls out of the plotted area. For GIF presets, derive the export viewBox and model layout from the selected frame ratio.