import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getSalesData() {
  const data = await db.order.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true,
  });

  return {
    amount: (data._sum.pricePaidInCents || 0) / 100,
    numberOfSales: data._count,
  };
}

export async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    db.user.count(),
    db.order.aggregate({
      _sum: { pricePaidInCents: true },
    }),
  ]);

  return {
    userCount,
    averageValuePerUser:
      userCount === 0
        ? 0
        : (orderData._sum.pricePaidInCents || 0) / userCount / 100,
  };
}

export async function getProductData() {
  const [activeCount, inactiveCount] = await Promise.all([
    db.product.count({ where: { isAvailableForPurchase: true } }),
    db.product.count({ where: { isAvailableForPurchase: false } }),
  ]);

  return {
    activeCount,
    inactiveCount,
  };
}

export async function getAllProducts() {
  return await db.product.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

const WHERE_EXPIRED: Prisma.DiscountCodeWhereInput = {
  OR: [
    {
      limit: {
        not: null,
        lte: db.discountCode.fields.uses,
      },
      expiresAt: {
        not: null,
        lte: new Date(),
      },
    },
  ],
};

const SELECT_FIELDS: Prisma.DiscountCodeSelect = {
  id: true,
  allProducts: true,
  code: true,
  discountAmount: true,
  discountType: true,
  expiresAt: true,
  limit: true,
  uses: true,
  isActive: true,
  products: {
    select: {
      name: true,
    },
  },
  _count: {
    select: {
      orders: true,
    },
  },
};

export async function getExpiredDiscountCode() {
  return await db.discountCode.findMany({
    select: SELECT_FIELDS,
    where: WHERE_EXPIRED,
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getUnexpiredDiscountCode() {
  return await db.discountCode.findMany({
    select: SELECT_FIELDS,
    where: {
      NOT: WHERE_EXPIRED,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}
