import React from "react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";

const data = [
  { id: 1, name: "Jane Smith", age: 30 },
  { id: 2, name: "John Doe", age: 25 },
  { id: 3, name: "Bob Johnson", age: 35 },
];

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "age",
    header: "Age",
  },
];

const Table = (): JSX.Element => {
  const table = useMantineReactTable({
    columns,
    data,
    enablePagination: false,
    enableSorting: false,
    enableColumnActions: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    mantineTableProps: {
      highlightOnHover: false,
      withTableBorder: false,
      withRowBorders: true,
    },
  });
  return <MantineReactTable table={table} />;
};

export default Table;
