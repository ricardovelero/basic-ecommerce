import { Button } from "@/components/ui/button";
import PageHeader from "../_components/page-header";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2, MoreVerticalIcon, XCircleIcon } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { getExpiredDiscountCode, getUnexpiredDiscountCode } from "@/data/admin";

export default async function DiscountCodesPage() {
  const [unexpiredDiscountCodes, expiredDiscountCodes] = await Promise.all([
    getUnexpiredDiscountCode(),
    getExpiredDiscountCode(),
  ]);

  return (
    <>
      <div className='flex justify-between items-center gap-4'>
        <PageHeader>Coupons</PageHeader>
        <Button asChild>
          <Link href={"/admin/discount-codes/new"}>Add coupon</Link>
        </Button>
      </div>
      <DiscountCodesTable discountCodes={unexpiredDiscountCodes} />

      <div className='mt-8'>
        <h2 className='text-xl font-bold'>Expired Coupons</h2>
        <DiscountCodesTable dicountCodes={expiredDiscountCodes} />
      </div>
    </>
  );
}

type DiscountCodesTableProps = {
  discountCodes: Awaited<ReturnType<typeof getUnexpiredDiscountCode>>;
};

function DiscountCodesTable({ discountCodes }: DiscountCodesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-0'>
            <span className='sr-only'>Is Active</span>
          </TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Remaining Uses</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead>Products</TableHead>
          <TableHead className='w-0'>
            <span className='sr-only'>Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coupons.map((coupon) => (
          <TableRow key={coupon.id}>
            <TableCell>
              {coupon.isAvailableForPurchase ? (
                <>
                  <CheckCircle2 />
                  <span className='sr-only'>Available</span>
                </>
              ) : (
                <>
                  <XCircleIcon className='stroke-destructive' />
                  <span className='sr-only'>Available</span>
                </>
              )}
            </TableCell>
            <TableCell>{coupon.name}</TableCell>
            <TableCell>{formatCurrency(coupon.priceInCents / 100)}</TableCell>
            <TableCell>{formatNumber(coupon._count.orders)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVerticalIcon />
                  <span className='sr-only'>Actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <a download href={`/admin/products/${coupon.id}/download`}>
                      Download
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={`/admin/products/${coupon.id}/edit`}>Edit</Link>
                  </DropdownMenuItem>
                  {/* <ActiveToggleDropdownItem
                    id={coupon.id}
                    isAvailableForPurchase={coupon.isAvailableForPurchase}
                  /> */}
                  <DropdownMenuSeparator />
                  {/* <DeleteDropdownItem
                    id={coupon.id}
                    disabled={coupon._count.orders > 0}
                  /> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
