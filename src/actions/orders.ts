"use server";

import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export async function userOrderExists(email: string, productId: string) {
  return (
    (await db.order.findFirst({
      where: {
        user: {
          email,
        },
        productId,
      },
      select: {
        id: true,
      },
    })) != null
  );
}

export async function deleteOrder(id: string) {
  const order = await db.order.delete({
    where: { id },
  });

  if (order == null) return notFound();

  return order;
}
