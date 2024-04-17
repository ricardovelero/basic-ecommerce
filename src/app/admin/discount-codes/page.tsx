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
import {
  CheckCircle2,
  Globe2Icon,
  InfinityIcon,
  MinusIcon,
  MoreVerticalIcon,
  XCircleIcon,
} from "lucide-react";
import {
  formatCurrency,
  formatNumber,
  formatDiscountCode,
  formatDateTime,
} from "@/lib/formatters";
import { getExpiredDiscountCode, getUnexpiredDiscountCode } from "@/data/admin";
import {
  ActiveToggleDropdownItem,
  DeleteDropdownItem,
} from "./_components/discount-code-actions";

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
      <DiscountCodesTable
        discountCodes={unexpiredDiscountCodes}
        canDeactivate
      />

      <div className='mt-8'>
        <h2 className='text-xl font-bold'>Expired Coupons</h2>
        <DiscountCodesTable discountCodes={expiredDiscountCodes} isInactive />
      </div>
    </>
  );
}

type DiscountCodesTableProps = {
  discountCodes: Awaited<ReturnType<typeof getUnexpiredDiscountCode>>;
  isInactive?: boolean;
  canDeactivate?: boolean;
};

function DiscountCodesTable({
  discountCodes,
  isInactive = false,
  canDeactivate = false,
}: DiscountCodesTableProps) {
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
        {discountCodes.map((code) => (
          <TableRow key={code.id}>
            <TableCell>
              {code.isActive && !isInactive ? (
                <>
                  <CheckCircle2 />
                  <span className='sr-only'>Active</span>
                </>
              ) : (
                <>
                  <XCircleIcon className='stroke-destructive' />
                  <span className='sr-only'>Inactive</span>
                </>
              )}
            </TableCell>
            <TableCell>{code.code}</TableCell>
            <TableCell>{formatDiscountCode(code)}</TableCell>
            <TableCell>
              {code.expiresAt == null ? (
                <MinusIcon />
              ) : (
                formatDateTime(code.expiresAt)
              )}
            </TableCell>
            <TableCell>
              {code.limit == null ? (
                <InfinityIcon />
              ) : (
                formatNumber(code.limit - code.uses)
              )}
            </TableCell>
            <TableCell>{formatNumber(code._count.orders)}</TableCell>
            <TableCell>
              {code.allProducts == null ? (
                <Globe2Icon />
              ) : (
                code.products.map((p) => p.name).join(", ")
              )}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVerticalIcon />
                  <span className='sr-only'>Actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {canDeactivate && (
                    <ActiveToggleDropdownItem
                      id={code.id}
                      isActive={code.isActive}
                    />
                  )}
                  <DropdownMenuSeparator />
                  <DeleteDropdownItem
                    id={code.id}
                    disabled={code._count.orders > 0}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
