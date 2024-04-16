"use server";

import OrderHistoryEmail from "@/email/order-history";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY as string);

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

export const emailSchema = z.string().email();

export async function emailOrderHistory(
  prevState: unknown,
  formData: FormData
): Promise<{ message?: string; error?: string }> {
  const result = emailSchema.safeParse(formData.get("email"));

  if (result.success === false) {
    return { error: "Invalid email address" };
  }

  const user = await db.user.findUnique({
    where: {
      email: result.data,
    },
    select: {
      email: true,
      orders: {
        select: {
          pricePaidInCents: true,
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (user == null) {
    return {
      message:
        "Check your email to view your order history and download your products.",
    };
  }

  const orders = user.orders.map(async (order) => {
    return {
      ...order,
      downloadVerificationId: (
        await db.downloadVerification.create({
          data: {
            expiresAt: new Date(Date.now() + 24 * 1000 * 60 * 60),
            productId: order.product.id,
          },
        })
      ).id,
    };
  });

  const data = await resend.emails.send({
    from: `Support <${process.env.SENDER_EMAIL}>`,
    to: user.email,
    subject: "Order History",
    react: <OrderHistoryEmail orders={await Promise.all(orders)} />,
  });

  if (data.error) {
    return { error: "There was an error sending your email, plea try again" };
  }

  return {
    message:
      "Check your email to view your order history and download your products.",
  };
}
