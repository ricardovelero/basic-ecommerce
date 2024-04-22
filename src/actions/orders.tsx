"use server";

import OrderHistoryEmail from "@/email/order-history";
import { db } from "@/lib/db";
import {
  getDiscountedAmount,
  usableDiscountCodeWhere,
} from "@/lib/discountCodeHelper";
import { error } from "console";
import { notFound } from "next/navigation";
import { Resend } from "resend";
import Stripe from "stripe";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY as string);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

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

export async function createPaymentIntent(
  email: string,
  productId: string,
  discountCodeId?: string
) {
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
  });
  if (product == null) return { error: "Unexpected Error" };

  const discountCode =
    discountCodeId == null
      ? null
      : await db.discountCode.findUnique({
          where: { id: discountCodeId, ...usableDiscountCodeWhere(productId) },
        });

  if (discountCode == null && discountCodeId != null) {
    return { error: "Coupon has expired" };
  }

  const existingOrder = await db.order.findFirst({
    where: { user: { email }, productId },
    select: { id: true },
  });

  if (existingOrder != null) {
    return {
      error:
        "You have already purchased this product, try downloading it from My Orders page",
    };
  }

  const amount =
    discountCode == null
      ? product.priceInCents
      : getDiscountedAmount(discountCode, product.priceInCents);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "EUR",
    metadata: {
      productId: product.id,
      discountCodeId: discountCode?.id || null,
    },
  });

  if (paymentIntent.client_secret == null) {
    throw Error("Unknown error");
  }

  return { clientSecret: paymentIntent.client_secret };
}
