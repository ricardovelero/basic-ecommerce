import PageHeader from "@/app/admin/_components/page-header";
import DiscountCodeForm from "../_components/discount-code-form";
import { getAllProducts } from "@/data/admin";

export default async function NewDiscountCodePage() {
  const products = await getAllProducts();

  return (
    <>
      <PageHeader>Add Discount Code</PageHeader>
      <DiscountCodeForm products={products} />
    </>
  );
}
