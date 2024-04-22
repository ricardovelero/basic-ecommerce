"use client";

import { userOrderExists } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDiscountedAmount } from "@/lib/discountCodeHelper";
import { formatCurrency, formatDiscountCode } from "@/lib/formatters";
import { DiscountCodeType, Product } from "@prisma/client";
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

type CheckoutFormProps = {
  product: Product;
  clientSecret: string;
  discountCode?: {
    id: string;
    discountAmount: number;
    discountType: DiscountCodeType;
  };
};

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

export default function CheckoutForm({
  product,
  clientSecret,
  discountCode,
}: CheckoutFormProps) {
  const amount =
    discountCode == null
      ? product.priceInCents
      : getDiscountedAmount(discountCode, product.priceInCents);
  const isDiscounted = amount !== product.priceInCents;

  return (
    <div className='max-w-5xl w-full mx-auto space-y-8'>
      <div className='flex items-center gap-4'>
        <div className='aspect-video flex-shrink-0 w-1/3 relative'>
          <Image
            src={product.imagePath}
            alt={product.name}
            fill
            className='object-cover'
          />
        </div>
        <div>
          <div className='flex items-baseline gap-4 text-lg'>
            <div
              className={
                isDiscounted ? "line-through text-muted-foreground text-sm" : ""
              }
            >
              {formatCurrency(product.priceInCents / 100)}
            </div>
            {isDiscounted && <div>{formatCurrency(amount / 100)}</div>}
          </div>
          <h1 className='text-2xl font-bold'>{product.name}</h1>
          <div className='line-clamp-3 text-muted-foreground'>
            {product.description}
          </div>
        </div>
      </div>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <Form
          priceInCents={product.priceInCents}
          productId={product.id}
          discountCode={discountCode}
        />
      </Elements>
    </div>
  );
}

function Form({
  priceInCents,
  productId,
  discountCode,
}: {
  priceInCents: number;
  productId: string;
  discountCode?: {
    id: string;
    discountAmount: number;
    discountType: DiscountCodeType;
  };
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [email, setEmail] = useState<string>();
  const discountCodeRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const coupon = searchParams.get("coupon");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (stripe == null || elements == null || email == null) return;

    setIsLoading(true);

    const orderExists = await userOrderExists(email, productId);

    if (orderExists) {
      setErrorMessage(
        "You have already purchased this product, try downloading it from My Orders page"
      );
      setIsLoading(false);
    }

    stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchase-success`,
        },
      })
      .then(({ error }) => {
        if (error.type === "card_error" || error.type === "validation_error") {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An unknown error ocurred");
        }
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription className='text-destructive'>
            {errorMessage && <div>{errorMessage}</div>}
            {coupon != null && discountCode == null && (
              <div>Invalid discount code</div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentElement />
          <div className='mt-4'>
            <LinkAuthenticationElement
              onChange={(e) => setEmail(e.value.email)}
            />
          </div>
          <div className='space-y-2 mt-4'>
            <Label htmlFor='discountCode'>Coupon</Label>
            <div className='flex items-center gap-4'>
              <Input
                id='discountCode'
                type='text'
                name='discountCode'
                className='max-w-xs w-full'
                defaultValue={coupon || ""}
                ref={discountCodeRef}
              />
              <Button
                type='button'
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set("coupon", discountCodeRef.current?.value || "");
                  router.push(`${pathname}?${params.toString()}`);
                }}
              >
                Apply
              </Button>
              {discountCode != null && (
                <div className='text-muted-foreground'>
                  {formatDiscountCode(discountCode)} discount
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className='w-full'
            size={"lg"}
            disabled={stripe == null || elements == null || loading}
          >
            {loading
              ? "Processing..."
              : `Purchase - ${formatCurrency(priceInCents / 100)}`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
