# Data table comparison

| Option                         | Strengths                                                                                              | Tradeoffs                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| **`@sometic/data-table`**      | Portable engine + DOM resolve + React shell; controllable sort/filter/page/selection; URL sync helpers | Not a full spreadsheet; no CE; you own cell editing and chrome                                  |
| **TanStack Table**             | Mature headless API, huge ecosystem, excellent React DX                                                | Framework-centric patterns; less of a shared Vanilla/Vue behavior story with Sometic forms/auth |
| **AG Grid / commercial grids** | Rich editing, pivoting, enterprise features                                                            | Heavy bundle, visual lock-in, licensing                                                         |
| **Native `<table>` only**      | Zero deps                                                                                              | You reimplement sort, bulk select, a11y grid keyboard, server abort races                       |

Choose Sometic when table behavior must match the rest of the portable stack (forms, HTTP, query builder bridge) across React and Vanilla. Choose TanStack when you are React-only and want its plugin ecosystem. Choose AG Grid when you need spreadsheet-grade editing out of the box.
