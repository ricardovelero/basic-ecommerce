import PageHeader from "@/app/admin/_components/page-header";
import ProductForm from "@/app/admin/products/_components/product-form";
import { db } from "@/lib/db";

export default async function EditProductPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const product = await db.product.findUnique({
    where: {
      id,
    },
  });
  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <ProductForm product={product} />
    </>
  );
}
