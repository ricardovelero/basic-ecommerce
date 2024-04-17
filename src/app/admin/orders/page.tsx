import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MinusIcon, MoreVertical } from "lucide-react";
import PageHeader from "../_components/page-header";
import { DeleteDropDownItem } from "./_components/order-actions";

function getOrders() {
  return db.order.findMany({
    select: {
      id: true,
      pricePaidInCents: true,
      product: { select: { name: true } },
      user: { select: { email: true } },
      discountCode: { select: { code: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default function OrdersPage() {
  return (
    <>
      <PageHeader>Sales</PageHeader>
      <OrdersTable />
    </>
  );
}

async function OrdersTable() {
  const orders = await getOrders();

  if (orders.length === 0) return <p>No sales found</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Price Paid</TableHead>
          <TableHead>Coupon</TableHead>
          <TableHead className='w-0'>
            <span className='sr-only'>Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.product.name}</TableCell>
            <TableCell>{order.user.email}</TableCell>
            <TableCell>
              {formatCurrency(order.pricePaidInCents / 100)}
            </TableCell>
            <TableCell>
              {order.discountCode == null ? (
                <MinusIcon />
              ) : (
                order.discountCode.code
              )}
            </TableCell>
            <TableCell className='text-center'>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical />
                  <span className='sr-only'>Actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DeleteDropDownItem id={order.id} />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
