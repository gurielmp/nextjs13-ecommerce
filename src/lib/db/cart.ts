import { cookies } from "next/dist/client/components/headers";
import prisma from "./prisma";
import { Cart, CartItem, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOption } from "@/app/api/auth/[...nextauth]/route";

export type CartWithProduct = Prisma.CartGetPayload<{
  include: { items: { include: { product: true } } }
}>

export type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { product: true }
}>

export type ShoppingCart = CartWithProduct & {
  size: number
  subtotal: number
}

export async function getCart(): Promise<ShoppingCart | null> {
  const session = await getServerSession(authOption)

  let cart: CartWithProduct | null = null

  if (session) {
    cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
    })
  } else {
    const localCartId = cookies().get("localCartId")?.value
    cart = localCartId
      ? await prisma.cart.findUnique({
        where: { id: localCartId },
        include: { items: { include: { product: true } } },
      })
      : null
  }

  if (!cart) {
    return null
  }
  return {
    ...cart,
    size: cart.items.reduce((acc, item) => acc + item.quantity, 0),
    subtotal: cart.items.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0
    )
  }
}

export async function createCart(): Promise<ShoppingCart> {
  const session = await getServerSession(authOption)

  let newCart: Cart

  if (session) {
    newCart = await prisma.cart.create({
      data: {
        userId: session.user.id
      }
    })
  } else {
    newCart = await prisma.cart.create({
      data: {}
    })

    // Note : Needs encription + secure setting in production app
    cookies().set("localCartId", newCart.id)
  }


  return {
    ...newCart,
    items: [],
    size: 0,
    subtotal: 0
  }
}

export async function mergeAnonymousCartIntoUserCart(userId: string) {
  const localCartId = cookies().get("localCartId")?.value
  const localCart = localCartId
    ? await prisma.cart.findUnique({
      where: { id: localCartId },
      include: { items: true },
    })
    : null

  if (!localCart) return

  const userCart = await prisma.cart.findFirst({
    where: { userId },
    include: { items: true }
  })

  await prisma.$transaction(async (tx) => {
    if (userCart) {
      const mergedCartItems = mergeCartItems(localCart.items, userCart.items)
      await tx.cartItem.deleteMany({
        where: { cartId: userCart.id }
      })
      await tx.cartItem.createMany({
        data: mergedCartItems.map(item => ({
          cartId: userCart.id,
          productId: item.productId,
          quantity: item.quantity
        }))
      })
    } else {
      await tx.cart.create({
        data: {
          userId,
          items: {
            createMany: {
              data: localCart.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity
              }))
            }
          }
        }
      })
    }
    await tx.cart.delete({
      where: { id: localCart.id }
    })
    // throw Error("test")
    cookies().set("localCartId", "")
  })
}

function mergeCartItems(...cartItems: CartItem[][]) {
  return cartItems.reduce((acc, items) => {
    items.forEach((item) => {
      const existingItem = acc.find((i) => i.productId === item.productId);
      if (existingItem) {
        existingItem.quantity += item.quantity
      } else {
        acc.push(item)
      }
    })
    return acc
  }, [] as CartItem[])
}