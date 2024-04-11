import PageHeader from "@/app/admin/_components/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export default function AdminProductsPage() {
  return (
    <>
      <div className='flex justify-between items-center gap-4'>
        <PageHeader>Products</PageHeader>
        <Button asChild>
          <Link href={"/admin/products/new"}>Add product</Link>
        </Button>
      </div>
      <ProductsTable />
    </>
  );
}

function ProductsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-0'>
            <span className='sr-only'>Available for purchase</span>
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead className='w-0'>
            <span className='sr-only'>Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
    </Table>
  );
}
